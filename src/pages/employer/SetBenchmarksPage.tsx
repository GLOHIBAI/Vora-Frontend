import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRightIcon, ChevronLeftIcon, PlusIcon, TrashIcon } from '../../components/common/Icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import { toast } from 'react-hot-toast';
import { useSetBenchmarksMutation } from '../../services/queries/postHire';

interface BenchmarkRow {
  title: string;
  targetDate?: string;
  weight?: number;
  description?: string;
}

const SetBenchmarksPage: React.FC = () => {
  const { hireId } = useParams<{ hireId: string }>();
  const navigate = useNavigate();
  const setBenchmarksMutation = useSetBenchmarksMutation();

  const [benchmarks, setBenchmarks] = useState<BenchmarkRow[]>([
    { title: '30-Day Onboarding & Initial Milestone', targetDate: '', weight: 30, description: '' },
    { title: '60-Day Independent Project Delivery', targetDate: '', weight: 40, description: '' },
    { title: '90-Day Full Capability Assessment', targetDate: '', weight: 30, description: '' },
  ]);

  const handleAddBenchmark = () => {
    setBenchmarks([...benchmarks, { title: '', weight: 20, description: '' }]);
  };

  const handleRemoveBenchmark = (idx: number) => {
    if (benchmarks.length <= 1) return;
    setBenchmarks(benchmarks.filter((_, i) => i !== idx));
  };

  const handleUpdateBenchmark = (idx: number, field: keyof BenchmarkRow, val: any) => {
    setBenchmarks(benchmarks.map((b, i) => (i === idx ? { ...b, [field]: val } : b)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireId) {
      toast.error('Hire ID missing');
      return;
    }

    const invalid = benchmarks.some((b) => !b.title.trim());
    if (invalid) {
      toast.error('All benchmarks must have a title');
      return;
    }

    try {
      await setBenchmarksMutation.mutateAsync({
        hireId,
        body: { benchmarks },
      });
      toast.success('Performance benchmarks configured successfully');
      navigate(-1);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to set benchmarks');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 animate-in fade-in duration-300">
      <div className="flex items-center gap-2.5 text-[13px]">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-[#0047CC] flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <ChevronLeftIcon size={14} /> Back
        </button>
        <ChevronRightIcon size={12} className="text-gray-300" />
        <span className="text-gray-900 font-medium">Set Benchmarks</span>
      </div>

      <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[20px] font-bold text-gray-900">Define Performance Benchmarks</h1>
          <Button size="sm" variant="outline" onClick={handleAddBenchmark}>
            <PlusIcon size={14} className="mr-1" /> Add Goal
          </Button>
        </div>
        <p className="text-[13px] text-gray-400 mb-8 leading-relaxed">
          Define objective milestones and target timelines. Check-ins will evaluate progress against these targets.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {benchmarks.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-bold text-[#0047CC] uppercase tracking-wider">
                    Benchmark #{idx + 1}
                  </span>
                  {benchmarks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBenchmark(idx)}
                      className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                    >
                      <TrashIcon size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label="Title / Target Outcome"
                      required
                      value={item.title}
                      onChange={(e) => handleUpdateBenchmark(idx, 'title', e.target.value)}
                      placeholder="e.g. Complete clinical dataset ingestion pipeline"
                    />
                  </div>
                  <div>
                    <Input
                      label="Target Date (Optional)"
                      type="date"
                      value={item.targetDate || ''}
                      onChange={(e) => handleUpdateBenchmark(idx, 'targetDate', e.target.value)}
                    />
                  </div>
                </div>

                <Textarea
                  label="Description / Success Criteria"
                  value={item.description || ''}
                  onChange={(e) => handleUpdateBenchmark(idx, 'description', e.target.value)}
                  placeholder="Specific outputs, quality standards, or criteria for passing this benchmark..."
                  className="min-h-[70px]"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={setBenchmarksMutation.isPending}>
              {setBenchmarksMutation.isPending ? 'Saving...' : 'Save Benchmarks'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetBenchmarksPage;
