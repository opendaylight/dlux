/**
 * Copyright (c) 4.7.2014 Cisco.  All rights reserved.
 * 
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

define(['app/eline/eline.test.module.loader', 'common/layout/layout.module'], function() {
    
    var ElineUtils, ElineSvc, $httpBackend, $timeout;

    beforeEach(angular.mock.module('app.common.layout'));
    beforeEach(angular.mock.module('app.eline'));

    beforeEach(angular.mock.inject(function(_ElineUtils_, _ElineSvc_, _$httpBackend_, _$timeout_) {
          ElineUtils = _ElineUtils_;
          ElineSvc = _ElineSvc_;
          $httpBackend = _$httpBackend_;
          $timeout = _$timeout_;

      }));

    ddescribe('Eline', function() {

      describe('ElineServices', function(){
        var provisionData, epData;

        beforeEach( angular.mock.inject( function() {

          provisionData = {
              'el-1': {
                  ep1: {
                    'endpoint-id': 'ep1',
                    'port': 'port8',
                    'status': 0,
                    'switch': 'switch2',
                    'vlan': '101'
                  },
                  ep2:{
                    'endpoint-id': 'ep2',
                    'port': 'port7',
                    'status': 0,
                    'switch': 'switch2',
                    'vlan': '101'
                  },
                  name: 'el-1',
                  status: false
              },
              'el-2': {
                  ep1: {
                    'endpoint-id': 'ep1',
                    'port': 'port33',
                    'status': 0,
                    'switch': 'switch2',
                    'vlan': '101'
                  },
                  ep2:{
                    'endpoint-id': 'ep2',
                    'port': 'port33',
                    'status': 0,
                    'switch': 'switch2',
                    'vlan': '101'
                  },
                  name: 'el-2',
                  status: false
              },
              'el-3': {
                  ep1: {
                    'endpoint-id': 'ep6',
                    'port': 'port33',
                    'status': 0,
                    'switch': 'switch2',
                    'vlan': '101'
                  },
                  ep2:{
                    'endpoint-id': 'ep2',
                    'port': 'port33',
                    'status': 0,
                    'switch': 'switch2',
                    'vlan': '101'
                  },
                  name: 'el-3',
                  status: false
                }
            };
          epData = [
              {
                'circuit-id': null,
                'ip-address': null,
                'mac-address': null,
                'port': "port9",
                'remote-id': null,
                'static': true,
                'status': true,
                'switch': "switch2",
                'vlan': "101"
              }
            ];

        }));

        describe('ElineUtils', function(){

          it('matchEndpoints', function(){
            

            ElineUtils.matchEndpoints(provisionData, epData);
            expect(epData[0].hasOwnProperty('matched')).toBe(false);
            epData = [
              {
                'circuit-id': null,
                'ip-address': null,
                'mac-address': null,
                'port': "port8",
                'remote-id': null,
                'static': true,
                'status': true,
                'switch': "switch2",
                'vlan': "101"
              }
            ];
            ElineUtils.matchEndpoints(provisionData, epData);
            expect(epData[0].matched).toBe('ep1');

          });

          it('convertBase64toHex', function(){
            var string = 'AAZQF/9broA=',
                encodeString = ElineUtils.convertBase64toHex(string);

            expect(encodeString).toBe('0x00-0x06-0x50-0x17-0xff-0x5b-0xae-0x80');
            
            string = 'AAZQF/9broA';
            encodeString = ElineUtils.convertBase64toHex(string);
            expect(encodeString).toBe('');

          });

          it('deleteDisconnectedEndpoints', function(){
            var upEpIds = ['ep1','ep2'],
                endpoints = [{
                              'endpoint-id': 'ep1',
                              'static': false
                            },
                            {
                              'endpoint-id': 'ep2',
                              'static': true
                            },
                            {
                              'endpoint-id': 'ep3'
                            }
                            ];

            expect(endpoints.length).toBe(3);
            ElineUtils.deleteDisconnectedEndpoints(upEpIds, endpoints);
            expect(endpoints.length).toBe(2);

          });

          it('deleteDisconnectedElines', function(){
            var upElineIds = ['el-1','el-2'];

            expect(Object.keys(provisionData).length).toBe(3);
            ElineUtils.deleteDisconnectedElines(upElineIds, provisionData);
            expect(Object.keys(provisionData).length).toBe(2);

          });

          it('getEndpointById', function(){
            var epDataToAdd = [
                    {
                      'circuit-id': null,
                      'ip-address': null,
                      'mac-address': null,
                      'port': "port99999",
                      'remote-id': null,
                      'static': true,
                      'status': true,
                      'switch': "switch9999",
                      'vlan': "101"
                    }
                  ],
                epDataBefore = epData;//epData

            epData = [];
            ElineUtils.addEndpoints(epData, epDataToAdd);
            expect(epData.length).toBe(1);
            ElineUtils.addEndpoints(epDataBefore, epDataToAdd);
            expect(epDataBefore.length).toBe(2);
            epData = epDataBefore;
            ElineUtils.addEndpoints(epDataBefore, epData);
            expect(epDataBefore.length).toBe(2);
          });



        });

        describe('ElineSvc', function(){

          it('add_static_eps',function(){
            expect(epData.length).toBe(1);
            ElineSvc.add_static_eps(epData);
            expect(epData.length).toBe(4);
          });

          it('get_ep_status success', function(){
            var testSuccess = {
                              output: {
                                statuses: [
                                  {
                                    'an-id': {},
                                    'attach-id': "172.23.29.105:GigabitEthernet0/0/0/6.0:5",
                                    'ce-id': {
                                      'ce-ip': "192.168.7.128",
                                      'ce-mac': "00:11:00:ff:dd:02",
                                      'ce-vrf': "default"
                                    },
                                    'circuit-id': "AAQABQEF",
                                    'information-source': "access-dhcp:ac-information-dhcp-v4",
                                    'pe-id': "172.23.29.105",
                                    'remote-id': "AAZQF/9broA=",
                                    'status': "modify",
                                    'vlan-stack': {}
                                  }
                                ]
                              }
                            };

            $httpBackend.when('POST', 'http://localhost:8080/restconf/operations/service-status:get-endpoints-statuses').respond(testSuccess); 

            ElineSvc.get_ep_status(function(data){
              expect(data[0]['ip-address']).toBe("192.168.7.128");
              expect(data[0]['mac-address']).toBe("00:11:00:ff:dd:02");
              expect(data[0]['circuit-id']).toBe("AAQABQEF");
            });
            
            $httpBackend.flush();


          });

          it('get_ep_status error', function(){
            
            $httpBackend.when('POST', 'http://localhost:8080/restconf/operations/service-status:get-endpoints-statuses').respond(404,{error: true}); 

            ElineSvc.get_ep_status(function(data){},function(data){
              expect(data.error).toBe(true);
            });

            $httpBackend.flush();


          });

          it('get_odl_status success', function(){
            var responseObj = {
              nodes: {
                node: [
                  {
                    id: "172.23.29.105",
                    'netconf-node-inventory:connected': true
                  },
                  {
                    id: "172.23.29.104"
                  }
                ]
              }
            };

            $httpBackend.when('GET', 'http://localhost:8080/restconf/operational/opendaylight-inventory:nodes').respond(responseObj); 

            ElineSvc.get_odl_status(function(data){
              expect(data[0].id).toBe("172.23.29.105");
              expect(data[1].id).toBe("172.23.29.104");
              expect(data[0].status).toBe(true);
            });

            $httpBackend.flush();


          });

          it('get_odl_status error', function(){

            $httpBackend.when('GET', 'http://localhost:8080/restconf/operational/opendaylight-inventory:nodes').respond(404,{error: true}); 

            ElineSvc.get_odl_status(function(data){}, function(data){
              expect(data.error).toBe(true);
            });

            $httpBackend.flush();

          });

          it('get_eline_status success', function(){
            var responseObj = {
              'service-instances': {
                'service-instance': [
                  {
                    'service-id': "dummy-el",
                    'service-status:status': 'dummy-val',
                    'service-type': 'service-eline:eline-service',
                    endpoint: [
                      {
                        'endpoint-id': 'dummy-ep1',
                        'port' : 7,
                        'switch': 2,
                        'vlan': 101
                      },
                      {
                        'endpoint-id': 'dummy-ep2',
                        'port' : 7,
                        'switch': 2,
                        'vlan': 101
                      }
                    ]
                  }
                ]
              }
            };

            $httpBackend.when('GET', 'http://localhost:8080/restconf/config/service-instance:service-instances').respond(responseObj); 

            ElineSvc.get_eline_status(function(data){
              // console.log(data[0].data);
              expect(data[0].id).toBe("dummy-el");
              expect(data[0].data.status).toBe(false);
              expect(data[0].data.ep1['endpoint-id']).toBe('dummy-ep1');
              expect(data[0].data.ep2['endpoint-id']).toBe('dummy-ep2');
            });

            $httpBackend.flush();


          });
          
          it('get_eline_status error', function(){

            $httpBackend.when('GET', 'http://localhost:8080/restconf/config/service-instance:service-instances').respond(404,{error: true}); 

            ElineSvc.get_eline_status(function(data){}, function(data){
              expect(data.error).toBe(true);
            });

            $httpBackend.flush();

          });

          it('create_eline success', function(){
            var responseObj = {
              'service-instances': {
                'service-instance': [
                  {
                    'service-id': "dummy-el",
                    'service-status:status': 'dummy-val',
                    'service-type': 'service-eline:eline-service',
                    endpoint: [
                      {
                        'endpoint-id': 'dummy-ep1',
                        'port' : 7,
                        'switch': 2,
                        'vlan': 101
                      },
                      {
                        'endpoint-id': 'dummy-ep2',
                        'port' : 7,
                        'switch': 2,
                        'vlan': 101
                      }
                    ]
                  }
                ]
              }
            },
            elineData = [
              {
                elineId: 'dummyElName',
                ep1: {
                        'endpoint-id': 'dummy-ep1',
                        'port' : 7,
                        'switch': 2,
                        'vlan': 101
                      },
                ep2: {
                        'endpoint-id': 'dummy-ep2',
                        'port' : 7,
                        'switch': 2,
                        'vlan': 101
                      }
              }
            ];

            $httpBackend.when('POST', 'http://localhost:8080/restconf/config/service-instance:service-instances').respond(responseObj); 

            ElineSvc.create_eline(elineData, function(data){
              // console.log(data[0].data);
              // expect(data[0].id).toBe("dummy-el");
              // expect(data[0].data.status).toBe(false);
              // expect(data[0].data.ep1['endpoint-id']).toBe('dummy-ep1');
              // expect(data[0].data.ep2['endpoint-id']).toBe('dummy-ep2');
            });

            $httpBackend.flush();


          });


        });




      

      });


    });


          

});
