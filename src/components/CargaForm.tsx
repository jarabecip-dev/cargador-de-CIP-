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
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-xl mx-auto bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col"
    >
      <div className="p-8 h-20 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Cargar Registro</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nuevo ingreso operativo</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarea */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                Tarea
              </label>
              <select
                {...register('tarea')}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none"
              >
                <option value="">Seleccione línea...</option>
                {TAREAS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.tarea && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 px-1">{errors.tarea.message}</p>}
            </div>

            {/* CIP */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                CIP
              </label>
              <select
                {...register('cip')}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none"
              >
                <option value="">Seleccione CIP...</option>
                {CIPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.cip && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 px-1">{errors.cip.message}</p>}
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                Fecha
              </label>
              <input
                type="date"
                {...register('fecha')}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
              {errors.fecha && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 px-1">{errors.fecha.message}</p>}
            </div>

            {/* Hora */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                Hora
              </label>
              <input
                type="time"
                {...register('hora')}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
              {errors.hora && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 px-1">{errors.hora.message}</p>}
            </div>

            {/* Dato Numérico */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                Dato Numérico
              </label>
              <input
                type="number"
                step="any"
                {...register('dato_numerico', { valueAsNumber: true })}
                placeholder="0.00"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg font-mono"
              />
              {errors.dato_numerico && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 px-1">{errors.dato_numerico.message}</p>}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Guardar Datos
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
          >
            Cancelar operación
          </button>
        </div>
      </form>
    </motion.div>
  );
}
