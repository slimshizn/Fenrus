using Fenrus.Models;

namespace Fenrus.Services;

/// <summary>
/// Group Service
/// </summary>
public class GroupService
{
    /// <summary>
    /// Gets the system groups
    /// </summary>
    /// <param name="enabledOnly">If only enabled groups should be fetched</param>
    /// <returns>a list of all the system groups</returns>
    public List<Group> GetSystemGroups(bool enabledOnly = false)
        => DbHelper.GetAll<Group>().Where(x => x.IsSystem && x.UserUid == Guid.Empty && (enabledOnly == false || x.Enabled)).ToList();
    
    /// <summary>
    /// Gets all the groups for all users
    /// </summary>
    /// <returns>a list of groups</returns>
    public List<Group> GetAll()
        => DbHelper.GetAll<Group>();
    
    /// <summary>
    /// Gets all the groups for a user
    /// </summary>
    /// <param name="uid">The users UID</param>
    /// <returns>a list of groups</returns>
    public List<Group> GetAllForUser(Guid uid)
        => DbHelper.GetAllForUser<Group>(uid);

    /// <summary>
    /// Gets a group by its UID
    /// </summary>
    /// <param name="uid">the UID of the object to get</param>
    /// <returns>the group</returns>
    public Group GetByUid(Guid uid)
        => DbHelper.GetByUid<Group>(uid);

    /// <summary>
    /// Enables a group
    /// </summary>
    /// <param name="uid">the UID of the group to enable</param>
    /// <param name="enabled">the enabled state</param>
    public void Enable(Guid uid, bool enabled)
    {
        var group = GetByUid(uid);
        if (group == null)
            return;
        if (group.Enabled == enabled)
            return; // nothing to do
        group.Enabled = enabled;
        DbHelper.Update(group);
    }

    /// <summary>
    /// Adds a new group
    /// </summary>
    /// <param name="group">the new group being added</param>
    public void Add(Group group)
    {
        if(group.Uid == Guid.Empty)
            group.Uid = Guid.NewGuid();
        DbHelper.Insert(group);
    }

    /// <summary>
    /// Updates a group
    /// </summary>
    /// <param name="group">the group being updated</param>
    public void Update(Group group)
        => DbHelper.Update(group);

    /// <summary>
    /// Deletes a group
    /// </summary>
    /// <param name="uid">the UID of the group</param>
    public void Delete(Guid uid)
        => DbHelper.Delete<Group>(uid);
}