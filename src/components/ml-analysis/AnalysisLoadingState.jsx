import { motion } from "framer-motion";

const AnalysisLoadingState = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Prediction skeleton */}
      <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6">
        <div className="h-4 w-32 bg-slate-700 rounded animate-pulse mb-4" />
        <div className="flex items-center gap-4">
          <div className="h-10 w-28 bg-slate-700 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-3 bg-slate-700 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Two-column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color gradient skeleton */}
        <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6">
          <div className="h-4 w-40 bg-slate-700 rounded animate-pulse mb-4" />
          <div className="bg-slate-800 rounded-xl p-4 space-y-2">
            <div className="h-4 bg-slate-700 rounded animate-pulse w-full" />
            <div className="h-4 bg-slate-700 rounded animate-pulse w-4/5" />
            <div className="h-4 bg-slate-700 rounded animate-pulse w-3/5" />
          </div>
          <div className="mt-4 h-3 rounded-full bg-gradient-to-r from-red-500 via-slate-200 to-green-500 opacity-30 animate-pulse" />
        </div>

        {/* 3D plot skeleton */}
        <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6">
          <div className="h-4 w-48 bg-slate-700 rounded animate-pulse mb-4" />
          <div className="w-full h-[420px] bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Running LIME analysis...</p>
              <p className="text-slate-600 text-xs mt-1">This may take a few seconds</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisLoadingState;
