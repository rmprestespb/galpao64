-- Libera o cadastro de marcas novas direto no formulário de "Nova pré-venda"
-- (botão "+" ao lado do campo Marca), sem precisar de uma migração pra cada
-- nome novo. Antes, presale_products.brand só aceitava um dos 4 valores
-- travados no CHECK original (Mini GT, Pop Race, Tarmac Works, Kaido House).
--
-- Usa um DO block pra achar e remover o CHECK pelo nome real no banco (em
-- vez de supor "presale_products_brand_check"), e não falha caso ele já não
-- exista — seguro rodar mais de uma vez.
DO $$
DECLARE
  check_name text;
BEGIN
  SELECT conname INTO check_name
  FROM pg_constraint
  WHERE conrelid = 'public.presale_products'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%brand%IN%';

  IF check_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.presale_products DROP CONSTRAINT %I', check_name);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
