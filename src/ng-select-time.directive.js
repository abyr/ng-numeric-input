angular.module('ngSelectTime.components.ng-select-time')
    .directive('ngNumericInput', ngNumericInput);

function ngNumericInput() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'ng-select-time.template.html',

        scope: {
            hours: '=?',
            minutes: '=?',
            fromTimestamp: '@?',
            toTimestamp: '@?',
            autoFix: '@?',
            debug: '@?',
        },

        bindToController: true,

        controller: function ($scope) {
            // format
            this.fromTimestamp = this.fromTimestamp && Number(this.fromTimestamp);
            this.toTimestamp = this.toTimestamp && Number(this.toTimestamp);

            // init dates
            const fromDate = this.fromTimestamp && new Date(this.fromTimestamp);
            const toDate = this.toTimestamp && new Date(this.toTimestamp);

            // set scope values
            $scope.hours = this.hours || '00';
            $scope.minutes = this.minutes || '00';

            $scope.checkOutOfRange = !!(this.fromTimestamp || this.toTimestamp);
            $scope.autoFix = this.autoFix || false;
            $scope.debug = this.debug || false;

            // initial validation
            if (isOutOfRange()) {
                notifyWrongTime();
            }

            $scope.changeHours = () => {
                const newDate = createTodayDateTimeFromScopeValues();

                if (isOutOfRange()) {
                    notifyWrongTime();
                }

                this.date = newDate;
                this.hours = $scope.hours;
            }

            $scope.changeMinutes = () => {
                const isError = isInvalidMinutesValue();

                if (isError && $scope.autoFix) {
                    fixMinutes();
                    $scope.changeMinutes();
                }

                if (isError || isOutOfRange()) {
                    notifyWrongTime();
                }

                if ($scope.checkOutOfRange) {
                    this.date = createTodayDateTimeFromScopeValues();
                }

                this.minutes = $scope.minutes;
            }

            function isOutOfRange() {
                if (!$scope.checkOutOfRange) {
                    return false;
                }

                let isInvalid = false;

                const date = createTodayDateTimeFromScopeValues();

                if (fromDate && date < fromDate) {
                    $scope.debug && console.error('The date is over the range', $scope.hours, $scope.minutes);
                    isInvalid = true;
                } else if (toDate && date > toDate) {
                    $scope.debug && console.error('The date is under the range', $scope.hours, $scope.minutes);
                    isInvalid = true;
                }

                $scope.invalid = isInvalid;

                return isInvalid;
            }

            function isInvalidMinutesValue() {
                let isInvalid = false;

                if (!$scope.minutes || parseInt($scope.minutes, 10) > 59) {
                    isInvalid = true;
                }
                return isInvalid;
            }

            function fixMinutes() {
                if (!+$scope.minutes) {
                    $scope.minutes = '00';
                } else {
                    $scope.minutes = '59';
                }
            }

            function createTodayDateTimeFromScopeValues() {
                const date = new Date();

                date.setHours($scope.hours);
                date.setMinutes($scope.minutes);
                date.setSeconds(0);
                date.setMilliseconds(0);

                return date;
            }

            function notifyWrongTime() {
                $scope.debug && console.error('Invalid time', $scope.hours, $scope.minutes);
            }
        }
    }
}
