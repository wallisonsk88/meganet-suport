-- ATENÇÃO: HÁ DADOS IMPORTANTES? SE SIM, FAÇA BACKUP ANTES.
-- Este script RECRIA a tabela de ordens para garantir que as colunas estejam corretas.

DROP TABLE IF EXISTS public.orders;

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer TEXT NOT NULL,
    address TEXT NOT NULL,
    service_type TEXT NOT NULL,       -- snake_case
    description TEXT,
    scheduled_date DATE NOT NULL,     -- snake_case
    scheduled_time TIME NOT NULL,     -- snake_case
    status TEXT NOT NULL DEFAULT 'pending',
    resolution TEXT,
    completed_at TIMESTAMP WITH TIME ZONE, -- snake_case
    technician TEXT,
    created_by TEXT,                  -- snake_case
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Permissões
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON public.orders FOR ALL USING (true);
