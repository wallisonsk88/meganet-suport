-- Execute este comando no SQL Editor do seu projeto Supabase

-- 1. Adicionar coluna de imagem na tabela messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Criar um bucket de storage público chamado 'chat-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Segurança para o Storage (Permitir tudo para todos - MVP)
-- Permitir upload público
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chat-images');

-- Permitir leitura pública
CREATE POLICY "Public Select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-images');
