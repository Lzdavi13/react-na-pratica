import { Check, Loader2, X } from "lucide-react";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const createTagSchema = z.object({
  name: z.string().min(3, { message: "Minimum 3 characters." }),
});

type CreateTagType = z.infer<typeof createTagSchema>;

function getSlugFromString(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");
}

export function CreateTagForm() {
  const { register, handleSubmit, watch, formState } = useForm<CreateTagType>({
    resolver: zodResolver(createTagSchema),
  });

  const queryClient = useQueryClient();

  const slug = watch("name") ? getSlugFromString(watch("name")) : "";

  const { mutateAsync } = useMutation({
    mutationFn: async ({ name }: CreateTagType) => {
      // await new Promise((resolve) => setTimeout(resolve, 2000));

      await fetch(`http://localhost:3333/tags`, {
        method: "POST",
        body: JSON.stringify({
          title: name,
          slug,
          amountOfVideos: 0,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-tags"],
      });
    },
  });

  async function createTag({ name }: CreateTagType) {
    await mutateAsync({ name });
    toast.success("Tag has been created");
  }

  return (
    <form onSubmit={handleSubmit(createTag)} className="w-full space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium block" htmlFor="name">
          Tag name
        </label>
        <input
          type="text"
          id="name"
          className="border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-800/50 w-full text-sm outline-none"
          {...register("name")}
        />
        {formState.errors?.name && (
          <p className="text-sm text-red-400">
            {formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium block" htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          type="text"
          className="border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-800/50 w-full text-sm outline-none"
          readOnly
          value={slug}
        />
      </div>
      <div className="flex gap-4 mt-8 w-full items-center justify-end">
        <Dialog.Close asChild>
          <Button>
            <X className="size-3" /> Cancel
          </Button>
        </Dialog.Close>

        <Button
          disabled={formState.isSubmitting}
          className="bg-teal-400 text-teal-950"
          type="submit"
        >
          {formState.isSubmitting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
          Save
        </Button>
      </div>
    </form>
  );
}
