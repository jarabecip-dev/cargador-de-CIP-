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

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <div 
          onClick={() => { setView('idle'); setIsSidebarOpen(false); }}
          className="flex items-center gap-3 mb-8 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-blue-900/20">
            <Database size={20} />
          </div>
          <div>
            <span className="font-bold text-white block leading-none">DataMaster</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Operaciones</span>
          </div>
        </div>

        <nav className="space-y-1">
          <button 
            onClick={() => { setView('visualizacion'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'visualizacion' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Table size={20} />
            Visualizar Datos
          </button>
          <button 
            onClick={() => { setView('carga'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'carga' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <PlusCircle size={20} />
            Cargar Datos
          </button>
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-slate-800 rounded-2xl p-4 mb-4">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">Usuario Activo</p>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
               {user?.displayName ? user.displayName[0] : (user?.email ? user.email[0] : 'G')}
             </div>
             <div className="overflow-hidden">
               <p className="text-xs font-bold truncate">{user?.displayName || 'Invitado'}</p>
               <p className="text-[10px] text-slate-500 truncate">{user?.email || 'Modo sin conexión'}</p>
             </div>
          </div>
        </div>
        {user ? (
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-red-900/20 hover:text-red-400 text-slate-400 font-semibold rounded-xl transition-all border border-slate-700/50"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        ) : (
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all border border-blue-500/50 shadow-lg shadow-blue-900/20"
          >
            <LogIn size={16} />
            Iniciar Sesión
          </button>
        )}
      </div>
    </>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Temporarily bypassing login requirement as requested
  /*
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
  */

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
      <Toaster position="top-right" expand={false} richColors />
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Side Navigation (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-slate-900 text-white z-50 flex flex-col lg:hidden shadow-2xl"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Database size={24} />
            </button>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-slate-900 leading-tight">
                {view === 'idle' ? 'Inicio' : view === 'carga' ? 'Cargar Registro' : 'Visualización'}
              </h2>
              <p className="text-[10px] lg:text-sm text-slate-500 hidden sm:block">
                {view === 'idle' ? 'Panel de control' : view === 'carga' ? 'Complete los datos' : 'Historial de registros'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {view === 'visualizacion' && (
              <button 
                onClick={() => setView('carga')}
                className="px-3 lg:px-6 py-2 lg:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
              >
                <PlusCircle size={16} />
                <span className="hidden xs:inline">Nuevo</span>
              </button>
            )}
            {!user && (
              <button 
                onClick={handleLogin}
                className="sm:hidden p-2 text-blue-600 bg-blue-50 rounded-lg"
                title="Iniciar sesión"
              >
                <LogIn size={20} />
              </button>
            )}
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-auto custom-scrollbar p-4 lg:p-8">
          <AnimatePresence mode="wait">
            {view === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto h-full flex flex-col justify-center gap-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button 
                    onClick={() => setView('carga')}
                    className="group relative flex flex-col items-center bg-white p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all text-center overflow-hidden"
                  >
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                      <PlusCircle size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Cargar datos</h3>
                    <p className="text-slate-500 text-sm">Abre el formulario para ingresar un nuevo registro.</p>
                  </button>

                  <button 
                    onClick={() => setView('visualizacion')}
                    className="group relative flex flex-col items-center bg-white p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all text-center overflow-hidden"
                  >
                    <div className="w-20 h-20 bg-slate-50 text-slate-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
                      <Table size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Visualizar datos</h3>
                    <p className="text-slate-500 text-sm">Consulta y filtra el historial de registros.</p>
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'carga' && (
              <motion.div 
                 key="carga"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <VisualizacionLista />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
