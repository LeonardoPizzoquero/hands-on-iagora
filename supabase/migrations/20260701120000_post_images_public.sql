-- Torna o bucket `post-images` público para servir imagens via URL permanente
-- (getPublicUrl). Antes o bucket era privado e usava signed URLs com TTL de 1h,
-- o que fazia as imagens gravadas no conteúdo dos posts expirarem e quebrarem.
--
-- Segurança: escrita (INSERT/UPDATE/DELETE) continua restrita à própria pasta
-- {user_id}/... via RLS. Apenas a leitura passa a ser pública, o que é adequado
-- para um fórum de alunos (imagens não são sensíveis).

update storage.buckets
  set public = true
  where id = 'post-images';

-- Leitura pública: substitui a policy que exigia autenticação.
drop policy if exists "post_images_select_authenticated" on storage.objects;

create policy "post_images_select_public"
  on storage.objects for select
  to public
  using (bucket_id = 'post-images');
