
UPDATE public.project_demos SET is_active = false WHERE id IN (
  '26e8e9c0-c8f8-4427-8b5c-7385bea66521', -- Dashboard Financeiro (dupe of Sistema Financeiro)
  '1054bfd0-bf74-4556-86de-ed934ff07561'  -- LP para Imobiliária (we keep Condomínio which maps to landingImovel)
);
