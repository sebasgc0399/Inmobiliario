import SkeletonListado from '@/components/SkeletonListado';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-8">
      <SkeletonListado />
    </div>
  );
}
