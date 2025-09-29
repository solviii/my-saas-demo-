import { Skeleton } from "../ui/skeleton";

const TableSkeleton = () => {
	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="h-10 w-28" />
			</div>
			<div className="space-y-4">
				<div className="flex justify-between mb-4 gap-2">
					<Skeleton className="h-8 w-full sm:w-4/12" />
				</div>
				<div className="border rounded-lg overflow-hidden">
					<div className="bg-gray-50 p-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="flex justify-between p-2 gap-2">
								{[...Array(5)].map((_, j) => (
									<Skeleton key={j} className="h-6 w-4/6" />
								))}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
export default TableSkeleton;
