import { getUserWorkSpaces, getWorkspaceDashboardStats } from '@/actions/workspace';
import PageHeader from '@/components/custom/reusables'
import { db } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import WorkspacePlanBadge from './_components/WorkspacePlanBadge';
import { redirect } from 'next/navigation';
import WorkSpaceCard from './_components/WorkSpaceCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FolderLock, 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  ListTodo,
  TrendingUp,
  LayoutDashboard,
  BriefcaseBusiness
} from 'lucide-react';
import Link from 'next/link';

const getCurrentPlan = async () => {
  const { has } = await auth();
  if (has({ plan: "pro" })) return "pro";
  if (has({ plan: "starter" })) return "starter";
  return "free";
};

const getPriorityColor = (priority) => {
  const styles = {
    URGENT: "bg-red-500/10 text-red-400 border-red-500/20",
    HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-400/20",
    LOW: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
  };
  return styles[priority] || styles.LOW;
};

const getStatusColor = (status) => {
  const styles = {
    TODO: "bg-zinc-800 text-zinc-400 border-zinc-700",
    INPROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    INREVIEW: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  };
  return styles[status] || styles.TODO;
};

const WorkSpacePage = async () => {
  const user = await currentUser();
  if (!user) redirect("/");

  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
    select: {
      id: true,
      role: true,
      name: true,
      title: true,
      company: true,
      imageUrl: true,
      noOfFreeWorkspace: true,
    },
  });

  if (!dbUser) redirect("/");

  // Fetch workspaces and dashboard statistics in parallel
  const [workSpaces, dashboardStats] = await Promise.all([
    getUserWorkSpaces(),
    getWorkspaceDashboardStats(),
  ]);

  console.log(dashboardStats);
  
  const plan = await getCurrentPlan();
  const totalWrkspaces = plan === "free" ? 1 : plan === "starter" ? 5 : 15;

  return (
    <main className="min-h-screen bg-black text-white pb-12">
      {/* Page header */}
      <PageHeader
        label="COLLABORATION HUB"
        gray="Welcome back,"
        gold={dbUser.name?.split(" ")[0] ?? "CEO"}
        description={
          dbUser.title && dbUser.company
            ? `${dbUser.title} · ${dbUser.company}`
            : ""
        }
        right={
          <WorkspacePlanBadge
            plan={plan}
            noOfFreeWorkspace={dbUser.noOfFreeWorkspace}
            totalWrkspaces={totalWrkspaces}
            user={dbUser}
          />
        }
      />

      <section className="my-8 mx-8">
        <Tabs defaultValue="workspaces" className="w-full space-y-8">
          <TabsList className="bg-[#0f0f11] border border-white/5 p-1.5 rounded-2xl flex w-fit gap-1">
            <TabsTrigger 
              value="workspaces"
              className="px-6 py-3 rounded-xl text-sm font-medium text-stone-400 transition-all duration-300 data-[state=active]:bg-amber-400 data-[state=active]:text-black data-[state=active]:shadow-lg"
            >
              <BriefcaseBusiness className="w-4 h-4 mr-2 inline-block" />
              Workspaces ({workSpaces.length})
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="px-6 py-3 rounded-xl text-sm font-medium text-stone-400 transition-all duration-300 data-[state=active]:bg-amber-400 data-[state=active]:text-black data-[state=active]:shadow-lg"
            >
              <LayoutDashboard className="w-4 h-4 mr-2 inline-block" />
              Dashboard Stats
            </TabsTrigger>
          </TabsList>

          {/* WORKSPACES TAB CONTENT */}
          <TabsContent value="workspaces" className="space-y-6 outline-none">
            {workSpaces && workSpaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workSpaces.map((workspace) => (
                  <WorkSpaceCard workspace={workspace} key={workspace.id} userId={dbUser.id} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-yellow-500/20 rounded-[2rem] bg-linear-to-b from-yellow-500/5 to-transparent p-12 text-center backdrop-blur-sm">
                <div className="mb-6 text-7xl">📋</div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  No Workspaces Yet
                </h3>
                <p className="text-stone-400 mb-8 max-w-md">
                  Create your first workspace to start managing your projects and team collaboration.
                </p>
              </div>
            )}
          </TabsContent>

          {/* DASHBOARD TAB CONTENT */}
          <TabsContent value="dashboard" className="space-y-8 outline-none">
            
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <Card className="bg-[#0f0f11] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-amber-400/20 transition-all">
                <div className="absolute inset-0 bg-linear-to-b from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Workspaces Created</span>
                    <h4 className="text-3xl font-bold font-mono text-amber-300">{dashboardStats.totalWorkspacesOwned}</h4>
                    <p className="text-xs text-stone-400">Created by you</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center border border-amber-400/20">
                    <FolderLock className="w-6 h-6 text-amber-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0f0f11] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-amber-400/20 transition-all">
                <div className="absolute inset-0 bg-linear-to-b from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Workspaces Joined</span>
                    <h4 className="text-3xl font-bold font-mono text-amber-300">{dashboardStats.totalWorkspacesJoined}</h4>
                    <p className="text-xs text-stone-400">Collaborating as member</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center border border-amber-400/20">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0f0f11] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-amber-400/20 transition-all">
                <div className="absolute inset-0 bg-linear-to-b from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Tasks Assigned to You</span>
                    <h4 className="text-3xl font-bold font-mono text-amber-300">{dashboardStats.stats.totalTasks}</h4>
                    <p className="text-xs text-stone-400">Total items assigned</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center border border-amber-400/20">
                    <ClipboardList className="w-6 h-6 text-amber-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0f0f11] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-amber-400/20 transition-all">
                <div className="absolute inset-0 bg-linear-to-b from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Completed Tasks</span>
                    <h4 className="text-3xl font-bold font-mono text-amber-300">
                      {dashboardStats.stats.completedTasks} <span className="text-sm font-normal text-stone-500 font-mono">/ {dashboardStats.stats.totalTasks}</span>
                    </h4>
                    <p className="text-xs text-stone-400">{dashboardStats.stats.completionRate}% completion rate</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center border border-amber-400/20">
                    <CheckCircle2 className="w-6 h-6 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* PROGRESS & TIMELINE TIMELINE CARD */}
            <Card className="bg-[#0f0f11] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-linear-to-br from-amber-400/5 to-transparent blur-[50px] pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    Overall Progress Timeline
                  </h3>
                  <p className="text-sm text-stone-400">A high-level view of your task progress across all projects</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold font-mono text-amber-300">{dashboardStats.stats.completionRate}%</span>
                  <span className="text-xs text-stone-500 block uppercase tracking-wider font-semibold">Task Completion</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-6">
                <div className="h-3 w-full bg-stone-900 border border-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-amber-500 via-amber-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                    style={{ width: `${dashboardStats.stats.completionRate}%` }}
                  />
                </div>

                {/* Sub-metrics badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="bg-stone-900/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 block" /> Todo
                    </span>
                    <span className="text-xl font-bold font-mono">{dashboardStats.stats.todoTasks}</span>
                  </div>

                  <div className="bg-stone-900/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" /> In Progress
                    </span>
                    <span className="text-xl font-bold font-mono text-blue-400">{dashboardStats.stats.inProgressTasks}</span>
                  </div>

                  <div className="bg-stone-900/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block" /> In Review
                    </span>
                    <span className="text-xl font-bold font-mono text-yellow-400">{dashboardStats.stats.inReviewTasks}</span>
                  </div>

                  <div className="bg-stone-900/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> Completed
                    </span>
                    <span className="text-xl font-bold font-mono text-emerald-400">{dashboardStats.stats.completedTasks}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* DETAILED TASKS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* TASKS ASSIGNED TO ME */}
              <Card className="bg-[#0f0f11] border border-white/5 rounded-[2rem] p-6 flex flex-col h-[500px]">
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                      <ListTodo className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif font-bold text-white">Assigned to You</h4>
                      <p className="text-xs text-stone-500">Tasks assigned for you to complete</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-white/10 text-stone-400 font-mono">
                    {dashboardStats.tasksAssignedToMe.length} tasks
                  </Badge>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                  {dashboardStats.tasksAssignedToMe && dashboardStats.tasksAssignedToMe.length > 0 ? (
                    dashboardStats.tasksAssignedToMe.map((task) => (
                      <div key={task.id} className="bg-zinc-950 border border-white/5 rounded-2xl p-4 space-y-3 relative group hover:border-amber-400/20 transition-all duration-300">
                        <div className="flex items-start justify-between gap-4">
                          <h5 className="font-serif font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">{task.title}</h5>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1 text-stone-500">
                            <Layers className="w-3.5 h-3.5 text-amber-400/60" />
                            <span className="line-clamp-1">{task.project.workspace.name} &middot; {task.project.title}</span>
                          </div>
                          
                          {task.endDate && (
                            <div className="flex items-center gap-1 shrink-0 text-stone-500">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Due: {new Date(task.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-stone-600">Assigned by:</span>
                            <Avatar className="w-5 h-5 border border-white/10">
                              <AvatarImage src={task.assignedBy.imageUrl} />
                              <AvatarFallback className="text-[9px] bg-stone-800 text-white">
                                {task.assignedBy.name?.charAt(0) ?? "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] text-stone-500 font-medium line-clamp-1">{task.assignedBy.name}</span>
                          </div>
                          
                          <Link 
                            href={`/project/${task.project.id}`}
                            className="text-[10px] text-amber-400 flex items-center gap-0.5 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Open Board <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-14 h-14 bg-stone-900 border border-white/5 rounded-full flex items-center justify-center mb-4 text-2xl">🎉</div>
                      <h5 className="font-semibold text-white mb-1">No Assigned Tasks</h5>
                      <p className="text-xs text-stone-500 max-w-[250px]">You are all caught up! No tasks currently assigned to you.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* TASKS ASSIGNED BY ME */}
              <Card className="bg-[#0f0f11] border border-white/5 rounded-[2rem] p-6 flex flex-col h-[500px]">
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif font-bold text-white">Delegated Tasks</h4>
                      <p className="text-xs text-stone-500">Tasks you assigned to other members</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-white/10 text-stone-400 font-mono">
                    {dashboardStats.tasksAssignedByMe.length} delegated
                  </Badge>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                  {dashboardStats.tasksAssignedByMe && dashboardStats.tasksAssignedByMe.length > 0 ? (
                    dashboardStats.tasksAssignedByMe.map((task) => (
                      <div key={task.id} className="bg-zinc-950 border border-white/5 rounded-2xl p-4 space-y-3 relative group hover:border-amber-400/20 transition-all duration-300">
                        <div className="flex items-start justify-between gap-4">
                          <h5 className="font-serif font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">{task.title}</h5>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1 text-stone-500">
                            <Layers className="w-3.5 h-3.5 text-amber-400/60" />
                            <span className="line-clamp-1">{task.project.workspace.name} &middot; {task.project.title}</span>
                          </div>
                          
                          {task.endDate && (
                            <div className="flex items-center gap-1 shrink-0 text-stone-500">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Due: {new Date(task.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-stone-600">Assigned to:</span>
                            {task.assignedTo ? (
                              <>
                                <Avatar className="w-5 h-5 border border-white/10">
                                  <AvatarImage src={task.assignedTo.imageUrl} />
                                  <AvatarFallback className="text-[9px] bg-stone-800 text-white">
                                    {task.assignedTo.name?.charAt(0) ?? "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] text-stone-500 font-medium line-clamp-1">{task.assignedTo.name}</span>
                              </>
                            ) : (
                              <span className="text-[10px] text-stone-500 italic">Unassigned</span>
                            )}
                          </div>
                          
                          <Link 
                            href={`/project/${task.project.id}`}
                            className="text-[10px] text-amber-400 flex items-center gap-0.5 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Open Board <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-14 h-14 bg-stone-900 border border-white/5 rounded-full flex items-center justify-center mb-4 text-2xl">📋</div>
                      <h5 className="font-semibold text-white mb-1">No Delegated Tasks</h5>
                      <p className="text-xs text-stone-500 max-w-[250px]">You haven't assigned or delegated any tasks to others yet.</p>
                    </div>
                  )}
                </div>
              </Card>

            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default WorkSpacePage;