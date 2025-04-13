-- Create the hearings table
CREATE TABLE IF NOT EXISTS public.hearings (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    judge_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Only admins can create hearings
CREATE POLICY "Only admins can create hearings"
    ON public.hearings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update hearings
CREATE POLICY "Only admins can update hearings"
    ON public.hearings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can delete hearings
CREATE POLICY "Only admins can delete hearings"
    ON public.hearings
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Clients can view their case hearings
CREATE POLICY "Clients can view their case hearings"
    ON public.hearings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM cases
            WHERE cases.id = hearings.case_id
            AND cases.client_id = auth.uid()
        )
    );

-- Lawyers can view their assigned case hearings
CREATE POLICY "Lawyers can view their assigned case hearings"
    ON public.hearings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM cases
            WHERE cases.id = hearings.case_id
            AND cases.lawyer_id = auth.uid()
        )
    );

-- Judges can view hearings assigned to them
CREATE POLICY "Judges can view their assigned hearings"
    ON public.hearings
    FOR SELECT
    USING (
        hearings.judge_id = auth.uid()
    );

-- Admins can view all hearings
CREATE POLICY "Admins can view all hearings"
    ON public.hearings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.hearings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at(); 