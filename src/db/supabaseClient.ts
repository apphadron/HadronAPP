import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://haaojqmsxwbhsavpxkjr.supabase.co'; // Substitua pela sua URL do Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhYW9qcW1zeHdiaHNhdnB4a2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNTcyNDAsImV4cCI6MjA0OTYzMzI0MH0.AgkQAfEtEk8ee9spzWv4ZQ3cNalA_10RoCR6MbzlWD8'; // Substitua pela sua chave anônima

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
