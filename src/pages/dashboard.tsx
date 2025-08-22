import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Link } from 'react-router-dom';

// Typ pro naše statistiky
interface DashboardStats {
  svjCount: number;
  employeeCount: number;
  totalGrossWage: number;
}

// Komponenta pro zobrazení jedné statistiky
function StatCard({ title, value, linkTo }: { title: string; value: string | number; linkTo: string }) {
  return (
    <Link to={linkTo} className="bg-white shadow rounded-lg p-6 flex flex-col justify-between hover:bg-gray-50 transition-colors">
      <div>
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      </div>
    </Link>
  );
}

export function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Tato stránka bude brzy implementována.</p>
    </div>
  );
}