-- Profiles: 1:1 com auth.users. Identidade do fórum (autor de posts/comentários).
-- RLS é a camada final de defesa.

create type public.user_role as enum ('student', 'teacher');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SELECT: qualquer usuário autenticado lê perfis (necessário p/ exibir nome de autores).
-- profiles não guarda dados sensíveis.
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- UPDATE: apenas o dono edita o próprio perfil.
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Sem policy de INSERT/DELETE para usuários:
-- INSERT é feito pelo trigger security definer; DELETE ocorre por cascade do auth.users.

-- Cria profile automaticamente ao criar usuário no Auth. role sempre 'student'.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Impede que usuário comum altere o próprio role. Promoção a 'teacher' é feita
-- por operação administrativa (service role / SQL direto), que ignora RLS e não
-- passa por esta checagem de auth.uid().
create function public.prevent_role_self_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and auth.uid() = old.id then
    raise exception 'Você não pode alterar seu próprio cargo (role).';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_self_change
  before update on public.profiles
  for each row execute function public.prevent_role_self_change();

-- Funções de trigger não devem ser invocáveis via PostgREST RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_role_self_change() from public, anon, authenticated;
