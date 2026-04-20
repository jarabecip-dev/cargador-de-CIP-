import React from 'react';
import { LogIn, Database, Table, PlusCircle, LogOut } from 'lucide-react';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import CargaForm from './CargaForm';
import VisualizacionLista from './VisualizacionLista';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

type View = 'idle' | 'carga' | 'visualizacion';

export default function Dashboard() {
  const [user, setUser] = React.useState<User | null>(null);
  const [view, setView] = React.useState<View>('idle');
  const [authLoading, setAuthLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Bienvenido');
    } catch (error) {
      toast.error('Error al iniciar sesión');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 text-center"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Database size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Gestor de Operaciones</h1>
          <p className="text-slate-500 mb-8">Inicie sesión para gestionar los registros operativos de la planta.</p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <LogIn size={20} />
            Continuar con Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" expand={false} richColors />
      
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div 
            onClick={() => setView('idle')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md">
              <Database size={20} />
            </div>
            <div>
              <span className="font-bold text-slate-800 block leading-none">Gestor Operativo</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Dashboard Principal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right mr-2">
                <p className="text-sm font-bold text-slate-700">{user.displayName}</p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
             </div>
             <button 
              onClick={() => logout()}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Cerrar sesión"
             >
              <LogOut size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          {view === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-10"
            >
              <button 
                onClick={() => setView('carga')}
                className="group relative flex flex-col items-center bg-white p-12 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all border border-slate-100 text-center"
              >
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <PlusCircle size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Cargar datos</h3>
                <p className="text-slate-500">Abre el formulario para ingresar un nuevo registro operativo.</p>
                <div className="absolute top-4 right-4 text-slate-100 font-black text-6xl select-none group-hover:text-blue-50 transition-colors">01</div>
              </button>

              <button 
                onClick={() => setView('visualizacion')}
                className="group relative flex flex-col items-center bg-white p-12 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all border border-slate-100 text-center"
              >
                <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                  <Table size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Visualizar datos</h3>
                <p className="text-slate-500">Consulta y filtra el histórico de registros almacenados.</p>
                <div className="absolute top-4 right-4 text-slate-100 font-black text-6xl select-none group-hover:text-green-50 transition-colors">02</div>
              </button>
            </motion.div>
          )}

          {view === 'carga' && (
            <motion.div 
               key="carga"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            >
              <CargaForm 
                onClose={() => setView('idle')} 
                onSuccess={() => setView('visualizacion')} 
              />
            </motion.div>
          )}

          {view === 'visualizacion' && (
            <motion.div 
              key="visualizacion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Histórico de Registros</h2>
                <button 
                  onClick={() => setView('idle')}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Volver al Menú
                </button>
              </div>
              <VisualizacionLista />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-10 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-400 font-medium">© 2026 Gestor de Operaciones · Planta de Procesamiento</p>
      </footer>
    </div>
  );
}
