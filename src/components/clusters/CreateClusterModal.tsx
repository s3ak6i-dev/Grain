import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input, { Textarea } from '@/components/ui/Input'
import { clusterSchema, type ClusterValues } from '@/lib/schemas'
import { useCreateCluster } from '@/hooks/useClusters'

interface CreateClusterModalProps {
  open: boolean
  onClose: () => void
}

export default function CreateClusterModal({ open, onClose }: CreateClusterModalProps) {
  const createCluster = useCreateCluster()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClusterValues>({ resolver: zodResolver(clusterSchema) })

  async function onSubmit(values: ClusterValues) {
    await createCluster.mutateAsync(values)
    reset()
    onClose()
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="New problem">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Problem name"
          placeholder="Export friction"
          hint="Name the underlying problem, not the feature request"
          error={errors.name?.message}
          {...register('name')}
        />
        <Textarea
          label="Description"
          placeholder="Users can't get their data out of the product to share with others"
          rows={3}
          hint="One sentence: what is the core user problem here?"
          error={errors.description?.message}
          {...register('description')}
        />

        {createCluster.isError && (
          <p className="text-xs text-red-500">
            {createCluster.error instanceof Error
              ? createCluster.error.message
              : 'Failed to create problem'}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1 border-t border-grain-border">
          <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={createCluster.isPending}>
            Create problem
          </Button>
        </div>
      </form>
    </Modal>
  )
}
