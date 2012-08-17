import scipy as sp
import scipy.ndimage as ndi
import pylab

x0 = 0.25
mu = 5.0


def sigmoid(t):
  return 1.0 / (1.0 + sp.exp(-mu * t))
  
def shallow(t):
  return sigmoid(t) - sigmoid(x0)
  
def steep(t):
  return sigmoid(t - 2.0*x0) - sigmoid(-x0)

def zero(t):
  return 0.0 * t

def downsample(f):
  for sigma in range(1, 10):
    pylab.plot(ndi.gaussian_filter1d(f, 2.0 ** sigma))
    
def make_gif():
  t = sp.arange(-5.0, 5.0, 0.01)
  for sigma in range(1, 10):
    pylab.clf()
    pylab.figtext(0,0,"sigma={0}".format(2**sigma))
    pylab.axis([-6.0, 6.0, -1.1, 1.1])
    A = ndi.gaussian_filter(shallow(t), 2.0**sigma)
    B = ndi.gaussian_filter(steep(t), 2.0**sigma)
    pylab.plot(t, A, 'b')
    pylab.plot(t, B, 'r')
    #pylab.plot(t, -1.0 * (A > 0), 'b')
    #pylab.plot(t, (B > 0), 'r')
    pylab.plot(t, zero(t), 'k')
    pylab.draw()
    pylab.savefig('frame{0}'.format(sigma))


