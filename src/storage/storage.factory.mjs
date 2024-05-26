import { MemoryQueueStrategy } from './strategies/memory.strategy.mjs'
import { MysqlQueueStrategy } from './strategies/mysql.strategy.mjs'

const strategies = [MemoryQueueStrategy, MysqlQueueStrategy];

/**
 * 
 * @param {MemoryQueueStrategy | MysqlQueueStrategy} cls 
 * @param {} args 
 */
export function queueFactory(cls, args) {
    return 
}
