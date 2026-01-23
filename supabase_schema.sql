-- COPIE ESTE CÓDIGO E COLE NO 'SQL EDITOR' DO SEU PROJETO SUPABASE

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'tecnico',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de ordens de serviço
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer TEXT NOT NULL,
    address TEXT NOT NULL,
    service_type TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    resolution TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    technician TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir usuário administrador padrão
INSERT INTO public.users (name, password, role)
VALUES ('wallisonsk88@gmail.com', 'Adryan@19', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Habilitar RLS (Opcional, mas recomendado)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Política simples para permitir acesso com a chave anon (apenas para este MVP)
CREATE POLICY "Allow all for anon" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON public.orders FOR ALL USING (true);
