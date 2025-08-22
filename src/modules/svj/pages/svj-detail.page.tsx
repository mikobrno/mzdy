import React from 'react';
import { useParams } from 'react-router-dom';

export function SvjDetailPage() {
  const { id } = useParams();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Detail SVJ (ID: {id})</h1>
      <p>Tato stránka bude brzy implementována.</p>
    </div>
  );
}