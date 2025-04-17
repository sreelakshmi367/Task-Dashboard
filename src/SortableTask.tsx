import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
} from '@mui/material';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate?: string;
  tags?: string[];
}

interface Props {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export const SortableTask: React.FC<Props> = ({
  task,
  onEdit,
  onDelete,
  dragHandleProps,
}) => {
  return (
    <Card className="bg-white shadow-sm p-2">
      <CardContent className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <Typography variant="h6" className="font-semibold text-gray-800">
            {task.title}
          </Typography>

          <Chip
            label={task.status}
            size="small"
            sx={{
              backgroundColor:
                task.status === "inprogress"
                  ? "#FEF08A"
                  : task.status === "done"
                  ? "#86EFAC"
                  : "#E5E7EB",
              color:
                task.status === "inprogress"
                  ? "#92400E"
                  : task.status === "done"
                  ? "#065F46"
                  : "#374151",
              fontWeight: 500,
            }}
          />
        </div>
        <Typography variant="body2" className="text-gray-500 text-sm truncate">
          {task.description}
        </Typography>
        <Typography variant="caption" className="mt-1 text-xs text-gray-400">
          Due: {task.dueDate || "N/A"}
        </Typography>
      </CardContent>
    </Card>
  );
};
