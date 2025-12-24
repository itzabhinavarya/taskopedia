import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDTO, UpdateTaskDTO, QueryTaskDto, TaskResponseDto } from './dto/index'
import { ApiResponse, response, responseInstance } from 'src/utils/response';
import { LoggerClient } from 'src/infrastructure/logger.client';
import { AuthGuard } from 'src/infrastructure/auth.guard';
import { GetUser } from 'src/infrastructure/get-user.decorator';
import type { JwtPayload } from 'src/infrastructure/jwt.service';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly loggerClient: LoggerClient
  ) { }

  @UseGuards(AuthGuard)
  @Get('')
  async allTasks(@GetUser() user: JwtPayload, @Query() query?: QueryTaskDto): Promise<ApiResponse<TaskResponseDto[]>> {
    this.loggerClient.log('Fetching all tasks', 'info');
    const { data, meta } = await this.taskService.getAll(query);
    this.loggerClient.log(`Successfully fetched ${data.length} tasks`, 'info');
    const result = responseInstance(TaskResponseDto, data) as TaskResponseDto[];
    return response<TaskResponseDto[]>({
      status: true,
      statusCode: 200,
      message: 'All Task fetched successfully',
      data: result,
      meta
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async singleTask(@GetUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number): Promise<ApiResponse<TaskResponseDto>> {
    this.loggerClient.log(`Fetching task with id: ${id}`, 'info');
    const result = await this.taskService.get(id);
    this.loggerClient.log(`Successfully fetched task with id: ${id}`, 'info');
    const data = responseInstance(TaskResponseDto, result) as TaskResponseDto;
    return response<TaskResponseDto>({
      status: true,
      statusCode: 200,
      message: 'Task fetched successfully',
      data: data,
    });
  }

  @UseGuards(AuthGuard)
  @Post()
  async createTask(@GetUser() user: JwtPayload, @Body() data: CreateTaskDTO): Promise<ApiResponse<TaskResponseDto>> {
    this.loggerClient.log('Creating a new task', 'info');
    const taskData = { ...data, userId: user.userId };
    const result = await this.taskService.create(taskData);
    this.loggerClient.log(`Task created with id: ${result.id}`, 'info');
    const res = responseInstance(TaskResponseDto, result) as TaskResponseDto;
    return response<TaskResponseDto>({
      status: true,
      statusCode: 200,
      message: 'Task created successfully',
      data: res,
    });
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateTask(@GetUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number, @Body() data: UpdateTaskDTO): Promise<ApiResponse<TaskResponseDto>> {
    this.loggerClient.log(`Updating task with id: ${id}`, 'info');
    const result = await this.taskService.update(id, data);
    this.loggerClient.log(`Successfully updated task with id: ${id}`, 'info');
    const res = responseInstance(TaskResponseDto, result) as TaskResponseDto;
    return response<TaskResponseDto>({
      status: true,
      statusCode: 200,
      message: 'Task updated successfully',
      data: res,
    });
  }

  @UseGuards(AuthGuard)
  @Patch('/archive/:id')
  async archiveTask(@GetUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number): Promise<ApiResponse<TaskResponseDto>> {
    this.loggerClient.log(`Archiving task with id: ${id}`, 'info');
    const result = await this.taskService.archive(id);
    this.loggerClient.log(`Successfully archived task with id: ${id}`, 'info');
    const data = responseInstance(TaskResponseDto, result) as TaskResponseDto;
    return response<TaskResponseDto>({
      status: true,
      statusCode: 200,
      message: 'Task archived successfully',
      data: data,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async deleteTask(@GetUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number): Promise<ApiResponse<TaskResponseDto>> {
    this.loggerClient.log(`Deleting task with id: ${id}`, 'info');
    const result = await this.taskService.delete(id);
    this.loggerClient.log(`Successfully deleted task with id: ${id}`, 'info');
    const data = responseInstance(TaskResponseDto, result) as TaskResponseDto;
    return response<TaskResponseDto>({
      status: true,
      statusCode: 200,
      message: 'Task deleted successfully',
      data: data,
    });
  }
}
