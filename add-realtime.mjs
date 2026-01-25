/**
 * Agregar price_history a Supabase Realtime
 */

const SUPABASE_URL = 'http://constructora-blu-supabase-b8d1d8-68-178-167-234.traefik.me';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjkxODkxNTAsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.K97vEiWdVvBuu0YeBaxqwL1RnnCRfBOdr7r-AJN_zAA';

const SQL = `
DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE price_history;
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'price_history ya está en supabase_realtime';
END $$;
`;

async function run() {
    console.log('🔄 Agregando price_history a Realtime...');

    try {
        const response = await fetch(`${SUPABASE_URL}/pg/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`
            },
            body: JSON.stringify({ query: SQL })
        });

        if (response.ok) {
            console.log('✅ price_history agregado a Realtime!');
        } else {
            const error = await response.text();
            console.log('Resultado:', response.status, error);
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}

run();
