namespace UniversalItemManagement.Server.Services.Contracts
{
    public interface IBackgroundTaskQueue
    {
        Task QueueBackgroundWorkItemAsync(
            Func<CancellationToken, Task> workItem);

        Task<Func<CancellationToken, Task>> DequeueAsync(
            CancellationToken cancellationToken);
    }
}
