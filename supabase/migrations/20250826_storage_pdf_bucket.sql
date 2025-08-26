-- Create bucket 'pdf' if it doesn't exist
insert into storage.buckets (id, name, public)
select 'pdf', 'pdf', false
where not exists (select 1 from storage.buckets where id = 'pdf');

-- Helpful index
create index if not exists idx_storage_objects_bucket_owner
  on storage.objects (bucket_id, owner);

-- Enable RLS on storage.objects (default is enabled, but ensure policies)
-- Policy model: per-user ownership via storage.objects.owner = auth.uid()

-- READ: allow users to read only their own objects in 'pdf'
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'pdf_read_own'
  ) then
    create policy pdf_read_own on storage.objects
      for select
      using (
        bucket_id = 'pdf'
        and (owner = auth.uid())
      );
  end if;
end $$;

-- WRITE (INSERT): allow user to upload only as themselves into 'pdf'
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'pdf_insert_own'
  ) then
    create policy pdf_insert_own on storage.objects
      for insert
      with check (
        bucket_id = 'pdf'
        and (owner = auth.uid())
      );
  end if;
end $$;

-- UPDATE: allow updating only own objects in 'pdf'
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'pdf_update_own'
  ) then
    create policy pdf_update_own on storage.objects
      for update
      using  (bucket_id = 'pdf' and owner = auth.uid())
      with check (bucket_id = 'pdf' and owner = auth.uid());
  end if;
end $$;

-- DELETE: allow deleting only own objects in 'pdf'
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'pdf_delete_own'
  ) then
    create policy pdf_delete_own on storage.objects
      for delete
      using (bucket_id = 'pdf' and owner = auth.uid());
  end if;
end $$;
