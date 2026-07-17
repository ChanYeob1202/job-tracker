"use client"

type DeleteButtonProps = {
  jobId: string; 
  onDelete?: () => void;
};

 
function DeleteButton({ jobId, onDelete }: DeleteButtonProps) {

  return (
  
      <button
        onClick={onDelete}
        className="px-2 bg-red-500 rounded-xl text-white cursor-pointer font-semibold"
      >
        delete
      </button>
  );
}

export default DeleteButton;
