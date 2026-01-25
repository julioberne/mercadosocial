import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Faltan credenciales de Supabase en .env');
}

console.log('🔄 Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Test connection on load
async function testConnection() {
    console.log('🔍 Testing Supabase connection...');

    // Test products table
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .limit(1);

    if (productsError) {
        console.error('❌ Products table error:', productsError.message);
        console.error('💡 Hint: Ejecuta db_setup.sql en Supabase SQL Editor');
    } else {
        console.log('✅ Products table OK. Found:', products?.length || 0, 'products');
    }

    // Test votes table
    const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('id')
        .limit(5);

    if (votesError) {
        console.error('❌ Votes table error:', votesError.message);
    } else {
        console.log('✅ Votes table OK. Found:', votes?.length || 0, 'votes');
    }

    // Test offers table
    const { data: offers, error: offersError } = await supabase
        .from('offers')
        .select('id')
        .limit(5);

    if (offersError) {
        console.error('❌ Offers table error:', offersError.message);
    } else {
        console.log('✅ Offers table OK. Found:', offers?.length || 0, 'offers');
    }
}

testConnection();
