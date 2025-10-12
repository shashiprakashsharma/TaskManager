// Simple in-memory storage for development when MongoDB is not available
class MemoryStorage {
  constructor() {
    this.data = {
      users: [],
      tasks: [],
      timeTrackings: [],
      notes: [],
      habits: [],
      goals: []
    };
  }

  // Generic methods for all collections
  async create(collection, data) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const item = { _id: id, ...data, createdAt: new Date(), updatedAt: new Date() };
    this.data[collection].push(item);
    return item;
  }

  async findById(collection, id) {
    return this.data[collection].find(item => item._id === id);
  }

  async find(collection, query = {}) {
    let results = this.data[collection];
    
    // Simple query matching
    Object.keys(query).forEach(key => {
      if (key === '_id') {
        results = results.filter(item => item._id === query[key]);
      } else {
        results = results.filter(item => item[key] === query[key]);
      }
    });
    
    return results;
  }

  async findOne(collection, query = {}) {
    const results = await this.find(collection, query);
    return results[0] || null;
  }

  async update(collection, id, updateData) {
    const index = this.data[collection].findIndex(item => item._id === id);
    if (index !== -1) {
      this.data[collection][index] = { 
        ...this.data[collection][index], 
        ...updateData, 
        updatedAt: new Date() 
      };
      return this.data[collection][index];
    }
    return null;
  }

  async delete(collection, id) {
    const index = this.data[collection].findIndex(item => item._id === id);
    if (index !== -1) {
      return this.data[collection].splice(index, 1)[0];
    }
    return null;
  }

  async countDocuments(collection, query = {}) {
    const results = await this.find(collection, query);
    return results.length;
  }

  // Time tracking specific methods
  async updateMany(collection, query, updateData) {
    const items = await this.find(collection, query);
    items.forEach(item => {
      const index = this.data[collection].findIndex(i => i._id === item._id);
      if (index !== -1) {
        this.data[collection][index] = { 
          ...this.data[collection][index], 
          ...updateData, 
          updatedAt: new Date() 
        };
      }
    });
    return items.length;
  }

  async aggregate(collection, pipeline) {
    // Simple aggregation for basic operations
    let results = this.data[collection];
    
    pipeline.forEach(stage => {
      if (stage.$match) {
        results = results.filter(item => {
          return Object.keys(stage.$match).every(key => {
            if (key === '_id') return item._id === stage.$match[key];
            return item[key] === stage.$match[key];
          });
        });
      }
      
      if (stage.$lookup) {
        // Simple lookup implementation
        const fromCollection = stage.$lookup.from;
        const localField = stage.$lookup.localField;
        const foreignField = stage.$lookup.foreignField;
        const as = stage.$lookup.as;
        
        results = results.map(item => {
          const relatedItems = this.data[fromCollection].filter(related => 
            related[foreignField] === item[localField]
          );
          return { ...item, [as]: relatedItems };
        });
      }
      
      if (stage.$unwind) {
        const field = stage.$unwind.replace('$', '');
        results = results.flatMap(item => 
          item[field] ? item[field].map(subItem => ({ ...item, [field]: subItem })) : [item]
        );
      }
      
      if (stage.$group) {
        const groupId = stage.$group._id;
        const groupFields = Object.keys(stage.$group).filter(key => key !== '_id');
        
        const grouped = {};
        results.forEach(item => {
          const key = groupId === null ? 'all' : item[groupId];
          if (!grouped[key]) {
            grouped[key] = { _id: key };
            groupFields.forEach(field => {
              const fieldConfig = stage.$group[field];
              if (fieldConfig.$sum) {
                grouped[key][field] = 0;
              } else if (fieldConfig.$avg) {
                grouped[key][field] = 0;
              } else if (fieldConfig.$push) {
                grouped[key][field] = [];
              }
            });
          }
          
          groupFields.forEach(field => {
            const fieldConfig = stage.$group[field];
            if (fieldConfig.$sum) {
              grouped[key][field] += item[fieldConfig.$sum.replace('$', '')] || 0;
            } else if (fieldConfig.$avg) {
              const currentSum = grouped[key][field] * (grouped[key]._count || 0);
              const newValue = item[fieldConfig.$avg.replace('$', '')] || 0;
              grouped[key]._count = (grouped[key]._count || 0) + 1;
              grouped[key][field] = (currentSum + newValue) / grouped[key]._count;
            } else if (fieldConfig.$push) {
              const pushField = fieldConfig.$push.replace('$', '');
              grouped[key][field].push({
                [pushField]: item[pushField],
                duration: item.duration
              });
            }
          });
        });
        
        results = Object.values(grouped);
      }
    });
    
    return results;
  }
}

// Create a singleton instance
const memoryStorage = new MemoryStorage();
export default memoryStorage;


