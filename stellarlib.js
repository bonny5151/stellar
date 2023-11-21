StellarSdk = require('stellar-sdk');
var u = 'https://horizon.stellar.org/'
server = new StellarSdk.Server(u)

getaccountkey = function getaccountkey(key) {
 return StellarSdk.Keypair.fromSecret(key)

}

gettransactions = async function getransactions(key) {
 
 key = getpublickey(key)
 return server.transactions().forAcount(key).call()
}

getpublickey = function getpublickey(key)
{
   return key.publicKey ? key.publicKey() : key
}

getaccount = async function getaccount(key) {
  key = getpublickey(key)
  return server.loadAccount(key)
}

getfee = async function getfee(multiply=1) {
  return server.fetchBaseFee(multiply)
}

startnewtransaction = async function startnewtransaction(key, ac)
{
   if(!ac) { ac = await getaccount(key)}
 var fee = await getfee(3)
 var transaction = new StellarSdk.TransactionBuilder(ac, { fee, networkPassphrase: StellarSdk.Networks.PUBLIC })
  return transaction
}

fundnewaccount = async function fundnewaccount({key, ac, to, amount}) {
 var transaction  = await startnewtransaction(key, ac)
 var t = StellarSdk.Operation.createAccount({destination: to, startingBalance: amount +""})

  var t1=transaction.addOperation(t).setTimeout(3000).build()
  t1.sign(key)
  var r=0; try{ r = await server.submitTransaction(t1)} catch(e) {r = e}
  return r
}

//{transaction , key , ac , to, amount} = 
send = async function send({key, ac, to, amount, memo})
{
   var transaction = await startnewtransaction(key, ac)
   var t1=transaction.addOperation(StellarSdk.Operation.payment({
               destination: to, asset: StellarSdk.Asset.native(), amount: amount + ""}))
   if(memo) { 
     t1 = t1.addMemo(StellarSdk.Memo.text(memo))
    }
   t1 = t1.setTimeout(3000).build()
   t1.sign(key)
   var r=0; try{ r = await server.submitTransaction(t1)} catch(e) {r = e}
   return r
}
