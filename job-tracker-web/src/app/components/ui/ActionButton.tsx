"use client"

type ActionButtonProps = {
  onEdit: () => void;
  onDelete?: () => void;
};

 
function ActionButton({ onEdit, onDelete }: ActionButtonProps) {
  return (
    <div className="flex flex-row gap-1">
      <button
        onClick={onEdit}
        className="px-2 bg-green-500 rounded-xl text-white cursor-pointer font-semibold"
      >
        edit
      </button>
      <button
        onClick={onDelete}
        className="px-2 bg-red-500 rounded-xl text-white cursor-pointer font-semibold"
      >
        delete
      </button>
    </div>
  );
}

export default ActionButton;
