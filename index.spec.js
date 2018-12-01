const { name } = require('faker');

const { processor } = require('.');

describe('compiler', () => {
  it('processes with env keys properly', (done) => {
    const item = {
      dev: name.firstName(),
      prod: name.firstName(),
    };

    processor(item, { environments: ['dev', 'prod'] }).then((res) => {
      expect(res[0]).toMatchObject({
        dev: item.dev,
        prod: item.prod,
      });
      done();
    });
  });

  it('processes arrays properly', (done) => {
    const item = {
      dev: ['hello'],
      prod: ['halo'],
    };

    processor(item, { environments: ['dev', 'prod'] }).then((res) => {
      expect(res[0]).toMatchObject({
        dev: item.dev,
        prod: item.prod,
      });
      expect(Array.isArray(res[0].dev)).toBe(true);
      done();
    });
  });

  it('does not use an env that does not exist', (done) => {
    const item = {
      test: name.firstName(),
    };

    processor(item, { environments: ['dev', 'prod'] }).then((res) => {
      expect(res[0]).not.toMatchObject({
        test: item.test,
      });
      done();
    });
  });

  it('handles super nesting properly', (done) => {
    const item = {
      min: {
        max: {
          minAgain: {
            maxAgain: {
              dev: '1',
              prod: '2'
            },
          },
        },
      },
    };
    processor(item, { environments: ['dev', 'prod'] }).then((res) => {
      expect(res[0].dev.min.max.minAgain.maxAgain).toBe(item.min.max.minAgain.maxAgain.dev);
      done();
    });
  });
});
