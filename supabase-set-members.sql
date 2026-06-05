-- Set all existing profiles to member role
update profiles
set role = 'member'
where role is null or role != 'creator';

-- Insert a member profile for any auth users who don't have one yet
insert into profiles (id, role)
select au.id, 'member'
from auth.users au
left join profiles p on p.id = au.id
where p.id is null;
