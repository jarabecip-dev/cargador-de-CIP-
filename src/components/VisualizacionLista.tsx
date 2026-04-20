import React from 'react';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Registro, Tarea, CIP } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Filter, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TAREAS: Tarea[] = ["Línea 1", "Línea 2", "Línea 3", "TK 1", "TK 2", "TK 3"];
const CIPS: CIP[] = ["CIP1", "CIP2", "CIP3"];

export default function VisualizacionLista() {
  const [registros, setRegistros] = React.useState<Registro[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({
    tarea: '',
    cip: '',
    searchId: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [sortBy, setSortBy] = React.useState<{ field: keyof Registro, direction: 'asc' | 'desc' }>({
    field: 'id',
    direction: 'desc'
  });
  const [selectedRegistro, setSelectedRegistro] = React.useState<Registro | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, 'registros'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.data().id,
      })) as Registro[];
      setRegistros(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredRegistros = registros.filter(r => {
    const matchTarea = !filters.tarea || r.tarea === filters.tarea;
    const matchCip = !filters.cip || r.cip === filters.cip;
    const matchId = !filters.searchId || r.id.toString().includes(filters.searchId);
    const matchFechaDesde = !filters.fechaDesde || r.fecha >= filters.fechaDesde;
    const matchFechaHasta = !filters.fechaHasta || r.fecha <= filters.fechaHasta;
    
    return matchTarea && matchCip && matchId && matchFechaDesde && matchFechaHasta;
  }).sort((a, b) => {
    const valA = a[sortBy.field];
    const valB = b[sortBy.field];
    
    if (valA < valB) return sortBy.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortBy.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Registro) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
          <Filter size={20} /> Filtros
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
          <div className="space-y-1">
            <label className="text-slate-500">ID</label>
            <input 
              type="text" 
              placeholder="Buscar ID..."
              value={filters.searchId}
              onChange={(e) => setFilters(f => ({ ...f, searchId: e.target.value }))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-500">Tarea</label>
            <select 
              value={filters.tarea}
              onChange={(e) => setFilters(f => ({ ...f, tarea: e.target.value }))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {TAREAS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-slate-500">CIP</label>
            <select 
              value={filters.cip}
              onChange={(e) => setFilters(f => ({ ...f, cip: e.target.value }))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {CIPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-slate-500">Desde</label>
            <input 
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => setFilters(f => ({ ...f, fechaDesde: e.target.value }))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-500">Hasta</label>
            <input 
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => setFilters(f => ({ ...f, fechaHasta: e.target.value }))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-100">
                <th onClick={() => handleSort('id')} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">ID {sortBy.field === 'id' && (sortBy.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}</div>
                </th>
                <th className="p-4">Tarea</th>
                <th onClick={() => handleSort('fecha')} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">Fecha {sortBy.field === 'fecha' && (sortBy.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}</div>
                </th>
                <th className="p-4">Hora</th>
                <th onClick={() => handleSort('dato_numerico')} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">Dato {sortBy.field === 'dato_numerico' && (sortBy.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}</div>
                </th>
                <th className="p-4">CIP</th>
                <th className="p-4">Creación</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistros.map((reg) => (
                <tr key={reg.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4 font-mono text-blue-600">#{reg.id}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-semibold text-slate-700">{reg.tarea}</span></td>
                  <td className="p-4 font-medium">{reg.fecha}</td>
                  <td className="p-4 text-slate-500">{reg.hora}</td>
                  <td className="p-4 font-bold text-slate-800">{reg.dato_numerico.toLocaleString()}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-blue-100 rounded-md text-xs font-semibold text-blue-700">{reg.cip}</span></td>
                  <td className="p-4 text-xs text-slate-400">
                    {reg.created_at?.toDate ? format(reg.created_at.toDate(), 'dd/MM/yy HH:mm', { locale: es }) : '-'}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setSelectedRegistro(reg)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRegistros.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No se encontraron registros coincidentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalle */}
      <AnimatePresence>
        {selectedRegistro && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Detalle de Registro #{selectedRegistro.id}</h3>
                <button onClick={() => setSelectedRegistro(null)} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">Tarea</span>
                  <span className="font-bold">{selectedRegistro.tarea}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">CIP</span>
                  <span className="font-bold">{selectedRegistro.cip}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">Fecha y Hora</span>
                  <span className="font-bold">{selectedRegistro.fecha} {selectedRegistro.hora}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">Dato Numérico</span>
                  <span className="font-bold text-blue-600 text-xl">{selectedRegistro.dato_numerico}</span>
                </div>
                <div className="pt-4 text-xs text-center text-slate-400">
                  Creado el: {selectedRegistro.created_at?.toDate && format(selectedRegistro.created_at.toDate(), 'PPP p', { locale: es })}
                </div>
              </div>
              <div className="p-6 bg-slate-50">
                <button 
                  onClick={() => setSelectedRegistro(null)}
                  className="w-full py-3 bg-white border border-slate-200 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
