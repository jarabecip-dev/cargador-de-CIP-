import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tarea, CIP, RegistroFormValues } from '../types';
import { addRegistro, handleFirestoreError } from '../lib/firebase';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon, Clock, Hash, Tag, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TAREAS: Tarea[] = ["Línea 1", "Línea 2", "Línea 3", "TK 1", "TK 2", "TK 3"];
const CIPS: CIP[] = ["CIP1", "CIP2", "CIP3"];

const schema = z.object({
  tarea: z.string().min(1, "La tarea es obligatoria"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  hora: z.string().min(1, "La hora es obligatoria"),
  dato_numerico: z.number().min(0, "Debe ser mayor o igual a 0").max(1000000000, "Valor demasiado alto"),
  cip: z.string().min(1, "El CIP es obligatorio"),
});

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CargaForm({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegistroFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      tarea: undefined,
      cip: undefined,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().split(' ')[0].slice(0, 5),
    }
  });

  const onSubmit = async (data: RegistroFormValues) => {
    setLoading(true);
    try {
      const result = await addRegistro(data);
      toast.success(`Registro #${result.id} guardado correctamente`);
      reset();
      onSuccess();
    } catch (error: any) {
      console.error(error);
      try {
        handleFirestoreError(error);
      } catch (formattedError: any) {
        toast.error("Error al guardar: " + formattedError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-slate-100"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cargar Datos</h2>
          <p className="text-slate-500 text-sm">Ingrese la información del registro operativo</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Tag size={16} className="text-slate-400" /> Tarea
            </label>
            <select
              {...register('tarea')}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            >
              <option value="">Seleccione una tarea</option>
              {TAREAS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.tarea && <p className="text-red-500 text-xs mt-1">{errors.tarea.message}</p>}
          </div>

          {/* CIP */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Hash size={16} className="text-slate-400" /> CIP
            </label>
            <select
              {...register('cip')}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            >
              <option value="">Seleccione un CIP</option>
              {CIPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.cip && <p className="text-red-500 text-xs mt-1">{errors.cip.message}</p>}
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <CalendarIcon size={16} className="text-slate-400" /> Fecha
            </label>
            <input
              type="date"
              {...register('fecha')}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
            {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha.message}</p>}
          </div>

          {/* Hora */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" /> Hora
            </label>
            <input
              type="time"
              {...register('hora')}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
            {errors.hora && <p className="text-red-500 text-xs mt-1">{errors.hora.message}</p>}
          </div>

          {/* Dato Numérico */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              Dato Numérico
            </label>
            <input
              type="number"
              step="any"
              {...register('dato_numerico', { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
            {errors.dato_numerico && <p className="text-red-500 text-xs mt-1">{errors.dato_numerico.message}</p>}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 p-4 bg-slate-100 text-slate-600 rounded-2xl font-semibold hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-3 p-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Guardar datos
          </button>
        </div>
      </form>
    </motion.div>
  );
}
