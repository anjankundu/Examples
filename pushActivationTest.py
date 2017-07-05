import requests
import json

def loginAsOperator ( username, password, host ):
	authDict = {'username':username, 'password':password}
	sessionObj = requests.Session()
	sessionObj.post( 'https://' + host + '/login/doOperatorLogin.html', json=authDict, verify=False )
	return sessionObj

def setSystemProperties ( sessionObj, host, vcoType ):
	if vcoType == "Redirector":
		bodyDict = {"jsonrpc":"2.0", "method":"systemProperty/insertSystemProperty", "params":{"name":"vco.management.isRedirector", "dataType":"BOOLEAN", "value":"true"}, "id":1}
		sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )

	bodyDict = {"jsonrpc":"2.0", "method":"systemProperty/insertSystemProperty", "params":{"name":"session.options.enablePushActivationBeta", "dataType":"BOOLEAN", "value":"true"}, "id":1}
	sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )

	bodyDict = {"jsonrpc":"2.0", "method":"systemProperty/insertSystemProperty", "params":{"name":"vco.management.skipSourceIpValidation", "dataType":"BOOLEAN", "value":"true"}, "id":1}
	sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )

def getManagedVcoUuid ( sessionObj, host ):
	bodyDict = {"jsonrpc":"2.0", "method":"systemProperty/getSystemProperty", "params":{"name":"vco.uuid"}, "id":1}
	respObj = sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )
	return json.loads( respObj.text )['result']['value']

def addManagedVcoOwner ( sessionObj, host, partnerName, partnerAccountNumber, partnerContactName, partnerContactEmail ):
	bodyDict = {"jsonrpc":"2.0", "method":"vcoInventory/insertVcoOwner", "params":{"name":partnerName, "accountNumber":partnerAccountNumber, "site":{"contactName":partnerContactName, "contactEmail":partnerContactEmail}}, "id":1}
	respObj = sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )
	return json.loads( respObj.text )['result']['id']

def addManagedVcoDetails ( sessionObj, host, uuid, managedHost, ownerId, managedVcoName ):
	bodyDict = {"jsonrpc":"2.0", "method":"vcoManagement/insertManagedVco", "params":{"vcoUuid":uuid, "name":managedVcoName, "vcoAddress":managedHost, "vcoSourceIp":managedHost, "vcoOwnerId":ownerId}, "id":1}
	respObj = sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )
	return json.loads( respObj.text )['result']['id']

def addRedirectorVcoDetails ( sessionObj, host, redirectorHost, redirectorVcoName ):
	bodyDict = {"jsonrpc":"2.0", "method":"vcoManagement/insertManagingVco", "params":{"vcoAddress":redirectorHost, "name":redirectorVcoName}, "id":1}
	respObj = sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )
	return json.loads( respObj.text )['result']['id']

def getManagingVcoStatus ( sessionObj, host ):
	bodyDict = {"jsonrpc":"2.0", "method":"vcoManagement/getManagingVco", "params":{}, "id":1}
	respObj = sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )
	return json.loads( respObj.text )['result']['vcoStatus']

def getManagedVcoStatus ( sessionObj, host, managedVcoId ):
	bodyDict = {"jsonrpc":"2.0", "method":"vcoManagement/getManagedVco", "params":{"id":managedVcoId}, "id":1}
	respObj = sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )
	return json.loads( respObj.text )['result']['vcoStatus']

def addEdgeInventory ( sessionObj, host, edgeSerialNumber, edgeUuid, edgeModelNumber ):
	bodyDict = {"jsonrpc":"2.0", "method":"vcoInventory/insertInventoryItem", "params":{"deviceSerialNumber":edgeSerialNumber, "deviceUuid":edgeUuid, "modelNumber":edgeModelNumber}, "id":1}
	respObj = sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )
	return json.loads( respObj.text )['result']['id']

def assignInventoryToManagedVco ( sessionObj, host, inventoryId, managedVcoId ):
	bodyDict = {"jsonrpc":"2.0", "method":"vcoInventory/updateInventoryItem", "params":{"id":inventoryId, "managedVcoId":managedVcoId}, "id":1}
	sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )

def getEdgeInventoryState ( sessionObj, host, inventoryId ):
	bodyDict = {"jsonrpc":"2.0", "method":"vcoInventory/getInventoryItem", "params":{"id":inventoryId}, "id":1}
	respObj = sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )
	return json.loads( respObj.text )['result']['inventoryState']

def assignInventoryToEnterprise ( sessionObj, host, inventoryId, enterpriseId ):
	bodyDict = {"jsonrpc":"2.0", "method":"vcoInventory/associateEdge", "params": {"edgeInventoryId":inventoryId, "enterpriseId":enterpriseId} , "id":1}
	sessionObj.post( 'https://' + host + '/portal/', json=bodyDict, verify=False )
