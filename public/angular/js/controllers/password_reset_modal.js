angular.module('Aggie')

.controller('PasswordResetModalController', [
  '$rootScope',
  '$scope',
  '$modal',
  '$http',
  function($rootScope, $scope, $modal, $http) {
    $rootScope.notices = [];

    $scope.open = function () {
      var modalInstance = $modal.open({
        controller: 'PasswordResetModalInstanceController',
        templateUrl: 'templates/password_reset_modal.html',
      });

      modalInstance.result.then(function(email) {
        $http.post('/reset-password', { email: email })
          .success(function(response) {
            $rootScope.notices.push('An email has been sent to ' + email + ' with instructions for resetting your password' );
          })
          .error(function(mesg, status) {
            $rootScope.alerts.push(mesg);
          });
      });
    };
  }
])

.controller('PasswordResetModalInstanceController', [
  '$scope',
  '$modalInstance',
  function($scope, $modalInstance) {
    $scope.user = { email: '' };

    $scope.okay = function() {
      $modalInstance.close($scope.user.email);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
