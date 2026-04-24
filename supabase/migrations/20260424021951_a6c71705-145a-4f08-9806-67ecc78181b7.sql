
CREATE TYPE public.reservation_status AS ENUM ('na_garagem', 'aguardando_envio');

CREATE TABLE public.reservation_collectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  status public.reservation_status NOT NULL DEFAULT 'na_garagem',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.reservation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collector_id UUID NOT NULL REFERENCES public.reservation_collectors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservation_items_collector ON public.reservation_items(collector_id);

ALTER TABLE public.reservation_collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_items ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view collectors"
ON public.reservation_collectors FOR SELECT
USING (true);

CREATE POLICY "Anyone can view reservation items"
ON public.reservation_items FOR SELECT
USING (true);

-- Admin write on collectors
CREATE POLICY "Admins can insert collectors"
ON public.reservation_collectors FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update collectors"
ON public.reservation_collectors FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete collectors"
ON public.reservation_collectors FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin write on items
CREATE POLICY "Admins can insert items"
ON public.reservation_items FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update items"
ON public.reservation_items FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete items"
ON public.reservation_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER reservation_collectors_set_updated_at
BEFORE UPDATE ON public.reservation_collectors
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
