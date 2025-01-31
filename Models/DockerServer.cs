namespace Fenrus.Models;

/// <summary>
/// Docker server
/// </summary>
public class DockerServer: IModal, IUserModal
{
    /// <summary>
    /// Gets or sets the Uid 
    /// </summary>
    [LiteDB.BsonId]
    public Guid Uid { get; set; }

    /// <summary>
    /// Gets or sets the users UID
    /// </summary>
    public Guid UserUid { get; set; }
    
    /// <summary>
    /// Gets or sets the name
    /// </summary>
    public string Name { get; set; }
    
    /// <summary>
    /// Gets or sets the address of the docker server
    /// </summary>
    public string Address { get; set; }

    /// <summary>
    /// Gets or sets the port of the docker server.
    /// Default docker port is 2375
    /// </summary>
    public int Port { get; set; } = 2375;
}