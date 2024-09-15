'use client';
import { useEffect } from 'react';
   import { useRouter } from 'next/navigation';
   import ECommerce from "@/components/Dashboard/E-commerce";
   import DefaultLayout from "@/components/Layouts/DefaultLayout";
   import { supabase } from '../lib/supabseClient';

   export default function Home() {
     const router = useRouter();

     useEffect(() => {
       const checkUser = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) {
           router.push('/signin');
         }
       };

       checkUser();
     }, [router]);

     return (
       <DefaultLayout>
         <ECommerce />
       </DefaultLayout>
     );
   }