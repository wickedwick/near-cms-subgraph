import { near } from '@graphprotocol/graph-ts'
import { JSON } from 'json-as'
import { ExecutionOutcome, Receipt } from '../generated/schema'

export function handleReceipt(receiptWithOutcome: near.ReceiptWithOutcome): void {
  const receipt = receiptWithOutcome.receipt
  const block = receiptWithOutcome.block
  const actions = receipt.actions
  for (let i = 0; i < actions.length; i++) {
    handleAction(actions[i], receipt, block.header)
  }

  const outcome = receiptWithOutcome.outcome
  const executionOutcome: ExecutionOutcome = new ExecutionOutcome(receiptWithOutcome.block.header.hash.toString())
  executionOutcome.blockHash = receiptWithOutcome.block.header.hash.toString()
  executionOutcome.status = outcome.status.toValue().toString()

  executionOutcome.save()
}

function handleAction(action: near.ActionValue, receipt: near.ActionReceipt, blockHeader: near.BlockHeader): void {
  const data = action.data
  const kind = action.kind
  const signerId = receipt.signerId
  const hash = blockHeader.hash

  const newReceipt = new Receipt(hash.toString())
  newReceipt.kind = kind.toString()
  newReceipt.data = JSON.stringify(data)
  newReceipt.signerId = signerId

  newReceipt.save()
}
