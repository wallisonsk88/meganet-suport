-- Cria tabela de localizações para rastreamento
CREATE TABLE IF NOT EXISTS public.technician_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_name TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilita RLS
ALTER TABLE public.technician_locations ENABLE ROW LEVEL SECURITY;

-- Permite que qualquer um (anon) insira localizações (para simplificar o GPS do técnico)
CREATE POLICY "Allow anonymous inserts on technician_locations" 
ON public.technician_locations FOR INSERT 
WITH CHECK (true);

-- Permite leitura de localizações
CREATE POLICY "Allow public read on technician_locations" 
ON public.technician_locations FOR SELECT 
USING (true);

-- Index para performance nas buscas por tempo
CREATE INDEX IF NOT EXISTS idx_tech_locations_created_at ON public.technician_locations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tech_locations_user_id ON public.technician_locations(user_id);
