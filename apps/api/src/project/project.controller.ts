import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProjectService } from 'src/project/project.service';
import { CreateProjectDto, ProjectResponseDto, QueryProjectDto, UpdateProjectDto } from './dto'
import { ApiResponse, response, responseInstance } from 'src/utils/response';
import { LoggerClient } from 'src/infrastructure/logger.client';
import { AuthGuard } from 'src/infrastructure/auth.guard';
import { GetUser } from 'src/infrastructure/get-user.decorator';
import type { JwtPayload } from 'src/infrastructure/jwt.service';

@Controller('project')
export class ProjectController {

    constructor(
        private readonly projectService: ProjectService,
        private readonly loggerClient: LoggerClient
    ) { }

    @UseGuards(AuthGuard)
    @Get('')
    async allProject(@GetUser() user: JwtPayload, @Query() query?: QueryProjectDto): Promise<ApiResponse<ProjectResponseDto[]>> {
        this.loggerClient.log('Fetching all projects', 'info');
        const { data, meta } = await this.projectService.getAll(query);
        this.loggerClient.log(`Successfully fetched ${data.length} projects`, 'info');
        const result = responseInstance(ProjectResponseDto, data) as ProjectResponseDto[];
        return response<ProjectResponseDto[]>({
            status: true,
            statusCode: 200,
            message: 'All projects fetched successfully',
            data: result,
            meta: meta
        });
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getProject(@GetUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number): Promise<ApiResponse<ProjectResponseDto>> {
        this.loggerClient.log(`Fetching project with id: ${id}`, 'info');
        const data = await this.projectService.get(id);
        this.loggerClient.log(`Successfully fetched project with id: ${id}`, 'info');
        const result = responseInstance(ProjectResponseDto, data) as ProjectResponseDto;
        return response<ProjectResponseDto>({
            status: true,
            statusCode: 200,
            message: 'Project fetched successfully',
            data: result,
        });
    }

    @UseGuards(AuthGuard)
    @Post('')
    async createProject(@GetUser() user: JwtPayload, @Body() data: CreateProjectDto): Promise<ApiResponse<ProjectResponseDto>> {
        this.loggerClient.log('Creating a new project', 'info');
        const projectData = { ...data, userId: user.userId };
        const res = await this.projectService.create(projectData);
        this.loggerClient.log(`Project created with id: ${res.id}`, 'info');
        const result = responseInstance(ProjectResponseDto, res) as ProjectResponseDto;
        return response<ProjectResponseDto>({
            status: true,
            statusCode: 200,
            data: result,
            message: 'Project created successfully',
        });
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async updateProject(@GetUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number, @Body() data: UpdateProjectDto): Promise<ApiResponse<ProjectResponseDto>> {
        this.loggerClient.log(`Updating project with id: ${id}`, 'info');
        const res = await this.projectService.update(id, data);
        this.loggerClient.log(`Successfully updated project with id: ${id}`, 'info');
        const result = responseInstance(ProjectResponseDto, res) as ProjectResponseDto;
        return response<ProjectResponseDto>({
            status: true,
            statusCode: 200,
            data: result,
            message: 'Project updated successfully',
        });
    }

    @UseGuards(AuthGuard)
    @Patch('/archive/:id')
    async archiveProject(@GetUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number): Promise<ApiResponse<ProjectResponseDto>> {
        this.loggerClient.log(`Archiving project with id: ${id}`, 'info');
        const res = await this.projectService.archive(id);
        this.loggerClient.log(`Successfully archived project with id: ${id}`, 'info');
        const result = responseInstance(ProjectResponseDto, res) as ProjectResponseDto;
        return response<ProjectResponseDto>({
            status: true,
            statusCode: 200,
            data: result,
            message: 'Project archived successfully',
        });
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    async deleteProject(@GetUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number): Promise<ApiResponse<ProjectResponseDto>> {
        this.loggerClient.log(`Deleting project with id: ${id}`, 'info');
        const res = await this.projectService.delete(id);
        this.loggerClient.log(`Successfully deleted project with id: ${id}`, 'info');
        const result = responseInstance(ProjectResponseDto, res) as ProjectResponseDto;
        return response<ProjectResponseDto>({
            status: true,
            statusCode: 200,
            data: result,
            message: 'Project deleted successfully',
        });
    }
}
