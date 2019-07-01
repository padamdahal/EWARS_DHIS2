## DHIS2 implementation for Early Warning and Reporting System (EWARS) - Nepal

The additional code (EWARS specific implementation) in the index.html is below:

    <!-- EWARS Specific implementation -->
    	<link type="text/css" rel="stylesheet" href="/ewars-dhis-assets/jquery.calendars.package-2.1.0/css/jquery.calendars.picker.css" />
    	<script src="/ewars-dhis-assets/jquery.calendars.package-2.1.0/js/jquery.calendars.nepali.js"></script>
    	<link href="/ewars-dhis-assets/ewars-custom-form-style.css" rel="stylesheet" type="text/css" />
    	<script type="text/javascript" src="/ewars-dhis-assets/nepali.datepicker.v2.1.min.js"></script>
    	<script>
            try{
    			var eventCapture = angular.module('eventCapture');
    			eventCapture.directive('input', function () {
    				var link = function ($scope, element, attrs, ngModel) {
    					
    					var model = element.attr('ng-model');
    										
    					//if(model === 'currentEvent.eventDate' || model === 'currentEvent.ZBGo5bBUYGU'){
    					if(element.attr('max-date') != undefined && element.attr('d2-date-validator') != undefined){
    						var html = element.parent();
    						var customDateField = $('<input type="text" class="customDatePicker form-control ng-pristine ng-untouched ng-invalid ng-invalid-required ng-invalid-date-validator ng-invalid-future-date-validator" placeholder="Select Date" style="position:relative;float:left;display:block"/>');
    						customDateField.prependTo(html);
    						customDateField.next('input').css({"pointer-events":"none","border":"none","color":"#ccc","box-shadow":"none","position":"relative","float":"left"});
    						//customDateField.next('input').removeClass('.hasCalendarsPicker');
    						
    						customDateField.calendarsPicker({
    							calendar: $.calendars.instance('nepali'),
    							yearRange: '-120:+30',
    							duration: "fast",
    							showAnim: "",
    							dateFormat: 'yyyy-mm-dd',
    							onSelect: function(npDate) {
    								var engDate = BS2AD(npDate[0]._year+'-'+npDate[0]._month+'-'+npDate[0]._day);
    								$(this).next('input').val(engDate);
    								$(this).next('input').trigger("change");
    								$(this).next('input').trigger("blur");
    								$('.ui-datepicker-cmd-close').trigger("click");
    							}
    						});
    						
    						// Check if date exist - in case of editing existing record
    						if(eval('$scope.'+model) != null && eval('$scope.'+model) != ''){
    							var currentValue = eval('$scope.'+model);
    							var customDate = AD2BS(currentValue);
    							customDateField.val(customDate);
    						}
    					}
    					
    					/* filter options for municipality based on selected district*/
    					if(model == 'searchText'){
    						var parentWithD2 = element[0].parentElement.parentElement.parentElement.parentElement;
    						/*	Debugging
    							console.log(parentWithD2);
    							console.log($(parentWithD2).attr('d2-model-id'));
    							console.log($scope.d2Model);
    						*/
    						
    						if($(parentWithD2).attr('d2-model-id') === 'prStDes.hLXJqD7b9im.dataElement.id'){
    							if($scope.d2Model.pC8BBR3B0XX != null && $scope.d2Model.pC8BBR3B0XX != 'undefined'){
    								$scope.searchText = $scope.d2Model.pC8BBR3B0XX.substr(0, 3);
    								$scope.search($scope.d2Model.pC8BBR3B0XX.substr(0, 3));
    							}
    						}
    					}
    					
    					// Age Variable - currentEvent.caMyqMax9y7
    					if(model == 'currentEvent.caMyqMax9y7'){
    						var parent = element[0].parentElement;
    						
    						var html = '<input type="text" style="width:30% !important;float:left;" class="age-additional" id="age-year" placeholder="Year"/>';
    						html += '<input type="text" style="width:30% !important;float:left;" class="age-additional" id="age-month" placeholder="Month"/>';
    						html += '<input type="text" style="width:30% !important;float:left;" class="age-additional" id="age-day" placeholder="Day"/>';
    						
    						var options = $(html);
    						options.appendTo(parent);
    						$(element[0]).css('pointer-events','none');
    						$(element[0]).css('border','none');
    						$(element[0]).css('shadow','none');
    						
    						
    						// Todo - Distribute the existing value to year month and day inputs
    						
    						if($scope.currentEvent.caMyqMax9y7 != '' || $scope.currentEvent.caMyqMax9y7 != null){
    							var year = parseInt($scope.currentEvent.caMyqMax9y7) || '';
    							$('body #age-year').val(year);
    							var month = ($scope.currentEvent.caMyqMax9y7 - parseInt($scope.currentEvent.caMyqMax9y7))*12;
    							$('body #age-month').val(parseInt(month) || '');
    							var day = (month - parseInt(month))*30
    							day = parseInt(day) || '';
    							$('body #age-day').val(day);
    						}
    						////////////////////
    												
    						$('body #age-day').change(function(){	
    							var day = parseInt($('body #age-day').val()) || 0;
    							var month = parseInt($('body #age-month').val()) || 0;
    							var year = parseInt($('body #age-year').val()) || 0;
    							var newValue = year+month/12+day/365;
    							
    							$(element[0]).val(newValue.toFixed(3));
    							$(element[0]).trigger("change");
    						});
    						
    						$('body #age-month').change(function(){
    							var day = parseInt($('body #age-day').val()) || 0;
    							var month = parseInt($('body #age-month').val()) || 0;
    							var year = parseInt($('body #age-year').val()) || 0;
    							var newValue = year+month/12+day/365;
    							
    							$(element[0]).val(newValue.toFixed(3));
    							$(element[0]).trigger("change");
    						});
    						
    						$('body #age-year').change(function(){
    							var day = parseInt($('body #age-day').val()) || 0;
    							var month = parseInt($('body #age-month').val()) || 0;
    							var year = parseInt($('body #age-year').val()) || 0;
    							var newValue = year+month/12+day/365;
    							
    							$(element[0]).val(newValue.toFixed(3));
    							$(element[0]).trigger("change");
    						});
    					}
    				};
    				return { link: link };
    			});
    			
    			
    			eventCapture.directive('div', function () {
    				var link = function ($scope, element, attrs, ngModel) {
    					if(element.attr('class') == 'optionListInput ng-scope'){
    						$(element[0]).attr('tabIndex',0);
    						$(this).attr('tabIndex',0);
    						
    						$(this).on('focus',function(){
    							//$(this)[0].open();//.scope.toggleOptionList();
    							//alert('wow');
    						});
    						console.log($(this));
    					}
    				};
    				return { link: link };
    			});
    			
    		}catch(e){
    			console.log('eventCapture app is not initialized.');
    		}
            </script>
    		
    		<!-- end EWARS specific implementation -->

DHIS2 Version: 2.30