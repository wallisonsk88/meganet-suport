-- Execute este comando no SQL Editor do seu projeto Supabase

-- 1. Criar a tabela de mensagens
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar a replicação para a tabela messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- 3. Adicionar a tabela messages à publicação realtime existente
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 4. Política de Segurança Simples (Permitir tudo para todos - MVP)
CREATE POLICY "Allow all for messages" ON public.messages FOR ALL USING (true);
-- ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY; -- Descomente para ativar
