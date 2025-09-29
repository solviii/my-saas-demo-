import { toast } from "sonner";
import { Button } from "./ui/button";
import React, { useState } from "react";
import { Progress } from "./ui/progress";
import { useDropzone } from "react-dropzone";
import { cn, formatBytes } from "@/lib/utils";
import axios, { AxiosProgressEvent } from "axios";
import { XIcon, UploadCloud } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface ImageUploaderProps {
	uploadedImages: { fileName: string; fileUrl: string; fileSize?: number }[];
	setUploadedImages: React.Dispatch<
		React.SetStateAction<{ fileName: string; fileUrl: string; fileSize?: number }[]>
	>;
	form: UseFormReturn<any>;
}

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;

const ImageUploader: React.FC<ImageUploaderProps> = ({
	uploadedImages,
	setUploadedImages,
	form,
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
	const [uploadingImages, setUploadingImages] = useState<
		{ fileName: string; fileUrl: string; fileSize?: number }[]
	>([]);

	const onDrop = async (acceptedFiles: File[]) => {
		const newUploadingImages = acceptedFiles.map((file) => {
			setUploadProgress((prev) => ({
				...prev,
				[file.name]: 0,
			}));
			return {
				fileName: file.name,
				fileUrl: URL.createObjectURL(file),
				fileSize: file.size,
			};
		});
		setUploadingImages((prev) => [...prev, ...newUploadingImages]);

		for (const file of acceptedFiles) {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("upload_preset", uploadPreset as string);
			formData.append("api_key", apiKey as string);

			try {
				const response = await axios.post(
					`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
					formData,
					{
						onUploadProgress: (progressEvent: AxiosProgressEvent) => {
							if (progressEvent.total) {
								const percentage = Math.round(
									(progressEvent.loaded * 100) / progressEvent.total,
								);
								setUploadProgress((prev) => ({
									...prev,
									[file.name]: percentage,
								}));
							}
						},
					},
				);
				setUploadedImages((prev) => [
					...prev,
					{
						fileName: file.name,
						fileUrl: response.data.secure_url,
						fileSize: file.size,
					},
				]);
				setUploadingImages((prev) => prev.filter((img) => img.fileName !== file.name));
				form.setValue("images", [...form.getValues("images"), response.data.secure_url]);
			} catch (error) {
				toast.error(`Failed to upload ${file.name}`);
				setUploadingImages((prev) => prev.filter((img) => img.fileName !== file.name));
			}
		}
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: { "image/*": [] },
		multiple: true,
		onDragEnter: () => setIsDragging(true),
		onDragLeave: () => setIsDragging(false),
		onDropAccepted: () => setIsDragging(false),
		onDropRejected: (e) => {
			toast.error(e[0].errors[0].message);
			setIsDragging(false);
		},
	});

	const removeImage = (url: string) => {
		setUploadedImages((prev) => prev.filter((image) => image.fileUrl !== url));
		form.setValue(
			"images",
			form.getValues("images").filter((image: string) => image !== url),
		);
	};

	return (
		<div className="w-full">
			<div
				{...getRootProps()}
				className={cn(
					"border-2 border-dashed rounded-2xl p-8 transition-colors cursor-pointer",
					isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200",
					"text-center",
				)}
			>
				<input {...getInputProps()} />
				<h2 className="text-lg font-semibold text-gray-700 mb-4">
					Drag and drop to upload your images
				</h2>
				<Button type="button">
					<UploadCloud className="w-4 h-4 mr-2" />
					Browse Images
				</Button>
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mt-2 ">
				{[...uploadingImages, ...uploadedImages].map((file, index) => (
					<div
						key={index}
						className="flex bg-background shadow-xl ring-1 ring-gray-200 overflow-hidden flex-col items-center gap-1 rounded-xl"
					>
						<div className="relative w-full">
							<div className="flex gap-2 absolute top-0 right-0 z-10">
								<Button
									type="button"
									size="icon"
									variant="ghost"
									className="h-8 w-8"
									onClick={() => removeImage(file.fileUrl)}
								>
									<XIcon className="h-4 w-4" />
								</Button>
							</div>
							<div className="p-2 aspect-h-10 aspect-w-10">
								{/* eslint-disable-next-line @next/next/no-img-element  */}
								<img
									src={file.fileUrl}
									alt={`Upload ${index + 1}`}
									className="object-cover rounded-md"
								/>
							</div>
						</div>
						{file.fileSize ? (
							<div className={cn("flex-1 w-full", file.fileSize ? "p-2" : "")}>
								<div className="flex flex-col">
									<>
										<span className="text-base text-gray-800 truncate font-semibold capitalize">
											{file.fileName || `Image ${index + 1}`}
										</span>
										<div className="w-full flex justify-between">
											<span className="text-sm text-gray-600">
												{formatBytes(file.fileSize, "MB")}
											</span>
											<span className="text-sm text-gray-600">
												{uploadProgress[file.fileName] ?? 0}%
											</span>
										</div>
									</>
								</div>

								<Progress
									value={uploadProgress[file.fileName] ?? 0}
									className="mt-2"
								/>
							</div>
						) : null}
					</div>
				))}
			</div>
		</div>
	);
};

export default ImageUploader;
