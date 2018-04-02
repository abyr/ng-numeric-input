angular.module('ngSelectTime.components.ng-select-time')
    .directive('ngNumericInput', ngNumericInput);

/**
 * ngNumberInput - angular attribute directive
 *
 * HTML attributes
 * @param {any} ng-model
 * @param {number} [min] Defaults to 1.
 * @param {number} [max]
 * @param {number} [max-length] Defaults to 9
 * @param {boolean} [min-not-equal] Defaults to false
 * @param {boolean} [max-not-equal] Defaults to false
 *
 * @returns {Object}
 *
 * Usage example:
 * <input type="text" ng-numeric-input
 *   data-max-length="2"
 *   ng-model="inputModel"
 *   data-min="{{min}}"
 *   data-max="{{max}}" />
 */
function ngNumericInput() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, el, attrs, ngModelCtrl) {
            const NUMBER_REGEXP = /^\d+$/;

            let min = 1,
                max,
                lastValidValue = '00',
                minNotEqual = false,
                maxNotEqual = false,
                maxLength = 9;

            if (attrs.maxLength >= 1) {
                maxLength = +attrs.maxLength;
            }

            if (attrs.minNotEqual) {
                minNotEqual = true;
            }

            if (attrs.maxNotEqual) {
                maxNotEqual = true;
            }

            let selected = false;

            /**
             * On blur format single value format into double symbols
             *
             * Examples:
             *   1 -> 01
             *   0 -> 00
             */
            el.on('blur', function () {
                ngModelCtrl.$setViewValue(formatViewValue(ngModelCtrl.$viewValue));
                ngModelCtrl.$render();
                selected = false;
            });

            /**
             * Select text on click
             */
            el.on('click', function ($event) {
                if (!selected) {
                    $event.target.select();
                    selected = true;
                }
            });

            /**
             * Choose last for invalid or current formatted
             */
            ngModelCtrl.$parsers.push(function(input) {
                if (angular.isUndefined(input) || (input !== input)) {
                    input = '00';
                }

                const value = input.replace(/,/g, '');
                const empty = ngModelCtrl.$isEmpty(value);
                const isNum = NUMBER_REGEXP.test(value);

                if (empty || (isNum && numberLength(value) <= maxLength)) {
                    lastValidValue = value;
                } else {
                    ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
                    ngModelCtrl.$render();
                }

                ngModelCtrl.$setValidity('numeric', true);
                return lastValidValue;
            });

            /**
             * Get signs count checking string as a number
             *
             * @param {String} value
             * @returns {Number}
             */
            function numberLength(value) {
                var matchResult = String(value).match(/\d/g);

                if (matchResult) {
                    return matchResult.length;
                } else {
                    return 0;
                }
            }

            // Validate min value
            if (angular.isDefined(attrs.max)) {
                attrs.$observe('min', function (value) {
                    min = parseFloat(value || min);

                    minValidator(ngModelCtrl.$modelValue);
                });
            }

            ngModelCtrl.$parsers.push(minValidator);
            ngModelCtrl.$formatters.push(minValidator);

            // Validate max value
            if (angular.isDefined(attrs.max)) {
                attrs.$observe('max', function (val) {
                    max = parseFloat(val);

                    maxValidator(ngModelCtrl.$modelValue);
                });
                ngModelCtrl.$parsers.push(maxValidator);
                ngModelCtrl.$formatters.push(maxValidator);
            }

            /**
             * @param {Number} value
             * @returns {Number}
             */
            function minValidator(value) {
                const invalid = minNotEqual ? value <= min : value < min;

                if (invalid && !ngModelCtrl.$isEmpty(value)) {
                    ngModelCtrl.$setValidity('min', false);
                } else {
                    ngModelCtrl.$setValidity('min', true);
                }
                return value;
            }

            /**
             * @param {Number} value
             * @returns {Number}
             */
            function maxValidator(value) {
                const invalid = maxNotEqual ? value >= max : value > max;

                if (invalid && !ngModelCtrl.$isEmpty(value)) {
                    ngModelCtrl.$setValidity('max', false);
                } else {
                    ngModelCtrl.$setValidity('max', true);
                }
                return value;
            }

            /**
             * @param {Number} value
             * @returns {String}
             */
            function formatViewValue(value) {
                if (ngModelCtrl.$isEmpty(value) || !+value) {
                    return '00';
                } else {
                    return String(value).padStart(2, '0');
                }
            }
        }
    }
}
