-- Storage para imagens de posts. Bucket privado; servido via signed URL.
-- Limites de tipo/tamanho também validados no Server Action (defesa em camadas).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  false,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Path convention: {user_id}/{uuid}.{ext}. Dono = primeira pasta do path.

-- SELECT: autenticado pode ler objetos do bucket (acesso real via signed URL).
create policy "post_images_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'post-images');

-- INSERT: só na própria pasta.
create policy "post_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: só objetos da própria pasta.
create policy "post_images_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: só objetos da própria pasta.
create policy "post_images_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
