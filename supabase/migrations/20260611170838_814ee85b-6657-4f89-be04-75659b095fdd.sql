-- 1) mystery_lots
CREATE TABLE public.mystery_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  total_boxes int NOT NULL DEFAULT 50,
  sold_count int NOT NULL DEFAULT 0,
  is_closed boolean NOT NULL DEFAULT false,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.mystery_lots TO anon, authenticated;
GRANT ALL ON public.mystery_lots TO service_role;

ALTER TABLE public.mystery_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mystery lots are viewable by everyone"
ON public.mystery_lots FOR SELECT
USING (true);

CREATE POLICY "Admins can insert mystery lots"
ON public.mystery_lots FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update mystery lots"
ON public.mystery_lots FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete mystery lots"
ON public.mystery_lots FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER mystery_lots_set_updated_at
BEFORE UPDATE ON public.mystery_lots
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) mystery_boxes
CREATE TABLE public.mystery_boxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid NOT NULL REFERENCES public.mystery_lots(id) ON DELETE CASCADE,
  number int NOT NULL,
  collector_name text,
  product_name text,
  product_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lot_id, number)
);

GRANT SELECT ON public.mystery_boxes TO anon, authenticated;
GRANT ALL ON public.mystery_boxes TO service_role;

ALTER TABLE public.mystery_boxes ENABLE ROW LEVEL SECURITY;

-- CRITICAL: reveal data only readable when the lot is closed (server-enforced)
CREATE POLICY "Mystery boxes only visible when lot is closed"
ON public.mystery_boxes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mystery_lots l
    WHERE l.id = mystery_boxes.lot_id AND l.is_closed = true
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can insert mystery boxes"
ON public.mystery_boxes FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update mystery boxes"
ON public.mystery_boxes FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete mystery boxes"
ON public.mystery_boxes FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER mystery_boxes_set_updated_at
BEFORE UPDATE ON public.mystery_boxes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) Seed initial lot + 50 boxes
DO $$
DECLARE
  v_lot_id uuid;
  collectors text[] := ARRAY[
    'João M.','Maria S.','Pedro L.','Ana R.','Lucas F.',
    'Carla T.','Bruno A.','Júlia P.','Rafael C.','Fernanda B.',
    'Diego N.','Larissa K.','Thiago V.','Isabela G.','Marcos D.',
    'Patrícia E.','Ricardo O.','Camila H.','Felipe Z.','Beatriz Q.'
  ];
  i int;
  pname text;
BEGIN
  INSERT INTO public.mystery_lots (name, total_boxes, sold_count, is_closed)
  VALUES ('Lote 01', 50, 0, false)
  RETURNING id INTO v_lot_id;

  FOR i IN 1..50 LOOP
    pname := CASE
      WHEN i = 50 THEN 'Hot Wheels RLC Exclusivo'
      WHEN i = 49 THEN 'Mini GT Premium'
      ELSE 'Hot Wheels Mainline #' || i
    END;
    INSERT INTO public.mystery_boxes (lot_id, number, collector_name, product_name, product_image_url)
    VALUES (
      v_lot_id,
      i,
      collectors[((i - 1) % array_length(collectors, 1)) + 1],
      pname,
      'https://picsum.photos/seed/g64-mystery-' || i || '/600/600'
    );
  END LOOP;
END $$;