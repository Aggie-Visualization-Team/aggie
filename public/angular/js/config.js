angular.module('Aggie')

.value('mediaOptions', ['twitter', 'facebook', 'rss', 'elmo', 'ojo_con_el_voto'])

.value('statusOptions', ['Read', 'Unread', 'Flagged', 'Unflagged', 'Read & Unflagged'])

.value('userRoles', ['viewer', 'monitor', 'manager', 'admin'])

.value('incidentStatusOptions', ['open', 'closed'])

.value('veracityOptions', ['unconfirmed', 'confirmed true', 'confirmed false'])

.value('escalatedOptions', ['escalated', 'unescalated'])

.value('paginationOptions', {
  perPage: 25
});
