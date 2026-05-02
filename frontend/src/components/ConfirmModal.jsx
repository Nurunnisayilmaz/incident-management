import { X } from "lucide-react";

const ConfirmModal = ({
  open,
  title = "Are you sure?",
  description = "",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-2xl shadow-xl w-[360px] relative">

        {/* close icon */}
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 btn btn-ghost btn-xs"
        >
          <X size={16} />
        </button>

        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        <p className="text-sm text-base-content/70 mb-6">
          {description}
        </p>

        <div className="flex justify-end gap-2">
          <button className="btn btn-sm" onClick={onCancel}>
            Cancel
          </button>

          <button className="btn btn-sm btn-error" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;